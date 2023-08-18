import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

import prismadb from '@/lib/prismadb'

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = auth()
    const body = await req.json()
    const { name, billboardId } = body

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!name || !billboardId) {
      return new NextResponse(`${!name ? 'Name' : 'Billboard'} is required `, { status: 400 })
    }

    if (!params.storeId) {
      return new NextResponse('Store id is required', { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        userId,
        id: params.storeId
      }
    })

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const category = await prismadb.category.create({
      data: {
        name,
        billboardId,
        storeId: params.storeId
      }
    })

    return NextResponse.json(category)
  } catch (e) {
    console.log('[CATEGORIES_POST]', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) {
      return new NextResponse('Store id is required', { status: 400 })
    }

    const categories = await prismadb.category.findMany({
      where: {
        storeId: params.storeId
      }
    })

    return NextResponse.json(categories)
  } catch (e) {
    console.log('[CATEGORIES_GET]', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
