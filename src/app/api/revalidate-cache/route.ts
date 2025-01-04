import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {    
    const searchParams = request.nextUrl.searchParams
    const secret = searchParams.get('secret')

    // check secret
    if (!secret) {
        return Response.json({ message: 'Secret is required' }, { status: 400 })
    }

    const sha256 = crypto.createHash('sha256');
    sha256.update(secret);
    const hash = sha256.digest('hex');

    if (!process.env.NEXT_CACHE_REVALIDATE_SECRET_HASH) {
        return Response.json({ message: 'Secret is not set' }, { status: 500 })
    }

    // validate secret
    if (process.env.NEXT_CACHE_REVALIDATE_SECRET_HASH !== hash) {
        return Response.json({ message: 'Invalid secret' }, { status: 401 })
    }

    // revalidate cache
    revalidatePath('/', 'layout')
    return Response.json({ message: 'Revalidated' })
}