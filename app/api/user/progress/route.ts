import { NextRequest, NextResponse } from 'next/server';
import { getProgressHistory, loadStore, saveStore } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const history = getProgressHistory();
    const store = loadStore();
    return NextResponse.json({
      success: true,
      history,
      recentDiagnostics: Object.values(store.diagnostics || {}).slice(-5),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch progress' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === 'reset') {
      saveStore({
        students: {},
        profiles: {},
        diagnostics: {},
        lessons: {},
        history: [],
      });
      return NextResponse.json({ success: true, message: 'Store reset successfully' });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
