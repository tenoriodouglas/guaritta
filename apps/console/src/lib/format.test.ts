import { formatPlate, reasonLabel, unitLabel } from './format';

describe('format helpers', () => {
  it('formats plates', () => {
    expect(formatPlate('ABC1D23')).toBe('ABC-1D23');
    expect(formatPlate(null)).toBe('—');
  });

  it('translates reasons including low-confidence suffix', () => {
    expect(reasonLabel('Registered resident vehicle')).toBe('Veículo cadastrado de morador');
    expect(reasonLabel('Pre-authorized visitor; low read confidence, confirm the plate')).toBe(
      'Visitante pré-autorizado · baixa confiança na leitura',
    );
  });

  it('formats unit labels', () => {
    expect(unitLabel({ id: '1', block: 'A', number: '101' })).toBe('A-101');
    expect(unitLabel({ id: '1', block: '', number: '7' })).toBe('7');
  });
});
