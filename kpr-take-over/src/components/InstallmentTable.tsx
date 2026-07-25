import type { ComparisonResult } from '../lib/types';
import { formatRupiah } from '../lib/format';

export function InstallmentTable({ result, variant }: { result: ComparisonResult; variant?: 'panel' }) {
  const b1 = result.kpr1;
  const b2 = result.kpr2;
  return (
    <table className={variant === 'panel' ? 'tbl tbl--panel' : 'tbl'}>
      <thead>
        <tr>
          <th>Cicilan per bulan</th>
          <th>Bank 1</th>
          <th>Bank 2</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Masa fix</td>
          <td>{formatRupiah(b1.cicilanFix)}</td>
          <td>{formatRupiah(b2.cicilanFix)}</td>
        </tr>
        <tr>
          <td>Masa floating</td>
          <td>{formatRupiah(b1.cicilanFloating)}</td>
          <td className={b2.cicilanFloating < b1.cicilanFloating ? 'good' : undefined}>
            {formatRupiah(b2.cicilanFloating)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
