import { createTestApp, createUserAndLogin, eventually, type TestContext } from './helpers.js';

describe('Concierge flows (e2e)', () => {
  let ctx: TestContext;
  let admin: string;
  let concierge: string;
  let resident: string;
  let unitId: string;
  let otherUnitId: string;
  let deviceKey: string;

  beforeAll(async () => {
    ctx = await createTestApp();
    admin = await createUserAndLogin(ctx, { email: 'admin@test.local', role: 'ADMIN' });
    concierge = await createUserAndLogin(ctx, { email: 'porteiro@test.local', role: 'CONCIERGE' });

    unitId = (
      await ctx
        .http()
        .post('/api/units')
        .set('Authorization', admin)
        .send({ block: 'b', number: '12' })
        .expect(201)
    ).body.id;
    otherUnitId = (
      await ctx
        .http()
        .post('/api/units')
        .set('Authorization', admin)
        .send({ block: 'B', number: '13' })
        .expect(201)
    ).body.id;
    const residentId = (
      await ctx
        .http()
        .post('/api/residents')
        .set('Authorization', admin)
        .send({ unitId, name: 'Ana' })
        .expect(201)
    ).body.id;
    resident = await createUserAndLogin(ctx, { email: 'ana@test.local', role: 'RESIDENT', residentId });

    const gateId = (
      await ctx
        .http()
        .post('/api/gates')
        .set('Authorization', admin)
        .send({ name: 'Garagem', kind: 'VEHICLE_GATE' })
        .expect(201)
    ).body.id;
    deviceKey = (
      await ctx.http().post(`/api/gates/${gateId}/device-key`).set('Authorization', admin).expect(201)
    ).body.deviceKey;
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  const plateRead = (body: object) =>
    ctx.http().post('/api/devices/plate-reads').set('x-device-key', deviceKey).send(body).expect(201);

  it('enforces authentication and roles', async () => {
    await ctx.http().get('/api/units').expect(401);
    await ctx.http().post('/api/units').set('Authorization', concierge).send({ number: '1' }).expect(403);
    await ctx.http().get('/api/health').expect(200);
  });

  it('rejects duplicated units with 409', async () => {
    await ctx
      .http()
      .post('/api/units')
      .set('Authorization', admin)
      .send({ block: 'B', number: '12' })
      .expect(409);
  });

  it('lets residents manage only their own unit vehicles', async () => {
    await ctx
      .http()
      .post('/api/vehicles')
      .set('Authorization', resident)
      .send({ unitId: otherUnitId, plate: 'AAA1111' })
      .expect(403);
    await ctx
      .http()
      .post('/api/vehicles')
      .set('Authorization', resident)
      .send({ unitId, plate: 'abc-1234', model: 'Onix' })
      .expect(201);
  });

  it('identifies a resident vehicle by its Mercosul plate and opens after operator approval', async () => {
    const read = await plateRead({ plate: 'ABC1C34', confidence: 0.97 });
    expect(read.body).toMatchObject({
      subject: 'RESIDENT_VEHICLE',
      suggestion: 'APPROVE',
      status: 'PENDING',
      unitId,
    });

    const approved = await ctx
      .http()
      .post(`/api/access/requests/${read.body.id}/approve`)
      .set('Authorization', concierge)
      .send({})
      .expect(200);
    expect(approved.body.status).toBe('APPROVED');

    await ctx
      .http()
      .post(`/api/access/requests/${read.body.id}/deny`)
      .set('Authorization', concierge)
      .send({})
      .expect(409);

    await eventually(async () => {
      const inbox = await ctx.http().get('/api/notifications').set('Authorization', resident).expect(200);
      expect(inbox.body.map((n: { type: string }) => n.type)).toContain('VEHICLE_ENTERED');
    });
  });

  it('recognizes a pre-authorized visitor vehicle and tracks the visit', async () => {
    const visitor = await ctx
      .http()
      .post('/api/visitors')
      .set('Authorization', resident)
      .send({ unitId, name: 'Carlos', plate: 'BRA2E19' })
      .expect(201);

    const read = await plateRead({ plate: 'BRA-2E19', confidence: 0.9 });
    expect(read.body).toMatchObject({
      subject: 'VISITOR_VEHICLE',
      suggestion: 'APPROVE',
      visitorId: visitor.body.id,
    });

    await ctx
      .http()
      .post(`/api/access/requests/${read.body.id}/approve`)
      .set('Authorization', concierge)
      .send({})
      .expect(200);

    const visits = await ctx
      .http()
      .get('/api/visitors?status=INSIDE')
      .set('Authorization', resident)
      .expect(200);
    expect(visits.body[0]).toMatchObject({ id: visitor.body.id, status: 'INSIDE' });

    const exit = await plateRead({ plate: 'BRA2E19', confidence: 0.9, direction: 'OUT' });
    expect(exit.body).toMatchObject({ subject: 'VISITOR_VEHICLE', direction: 'OUT' });
  });

  it('suggests denial for blocked vehicles and flags unknown ones', async () => {
    const vehicle = await ctx
      .http()
      .post('/api/vehicles')
      .set('Authorization', admin)
      .send({ unitId, plate: 'XYZ9A55' })
      .expect(201);
    await ctx
      .http()
      .patch(`/api/vehicles/${vehicle.body.id}/status`)
      .set('Authorization', concierge)
      .send({ status: 'BLOCKED' })
      .expect(200);

    // Legacy form of the same plate must match too.
    const blocked = await plateRead({ plate: 'XYZ9055', confidence: 0.99 });
    expect(blocked.body).toMatchObject({ subject: 'BLOCKED_VEHICLE', suggestion: 'DENY' });

    const unknown = await plateRead({ plate: 'QWE9F87', confidence: 0.99 });
    expect(unknown.body).toMatchObject({ subject: 'UNKNOWN_VEHICLE', suggestion: 'REVIEW' });
  });

  it('rejects invalid device keys', async () => {
    await ctx
      .http()
      .post('/api/devices/plate-reads')
      .set('x-device-key', 'nope')
      .send({ plate: 'ABC1234' })
      .expect(401);
  });

  it('notifies residents about deliveries', async () => {
    const delivery = await ctx
      .http()
      .post('/api/deliveries')
      .set('Authorization', concierge)
      .send({ unitId, carrier: 'Correios' })
      .expect(201);

    await eventually(async () => {
      const inbox = await ctx
        .http()
        .get('/api/notifications?unreadOnly=true')
        .set('Authorization', resident)
        .expect(200);
      expect(inbox.body.map((n: { type: string }) => n.type)).toContain('DELIVERY_RECEIVED');
    });

    await ctx
      .http()
      .patch(`/api/deliveries/${delivery.body.id}/pickup`)
      .set('Authorization', concierge)
      .send({ pickedUpBy: 'Ana' })
      .expect(200);
    await ctx.http().post('/api/notifications/read-all').set('Authorization', resident).expect(200);
  });

  it('summarizes the day access activity', async () => {
    const summary = await ctx.http().get('/api/access/summary').set('Authorization', concierge).expect(200);
    expect(summary.body.total).toBeGreaterThanOrEqual(5);
    expect(summary.body.byStatus.APPROVED).toBe(2);
  });
});
