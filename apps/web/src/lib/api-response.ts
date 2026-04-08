import { NextResponse } from "next/server";

export function ok<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ data, error: null, meta: meta ?? null });
}

export function fail(message: string, status = 400, meta?: Record<string, unknown>) {
  return NextResponse.json(
    { data: null, error: { message }, meta: meta ?? null },
    { status },
  );
}
