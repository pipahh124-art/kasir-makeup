import { need } from '../../../../lib/auth';
export async function GET() {
  const [s, err] = await need();
  return err || Response.json({ nama: s.nama, role: s.role });
}