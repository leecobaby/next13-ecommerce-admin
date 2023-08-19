import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

import prismadb from '@/lib/prismadb'

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; colorId: string } }
) {
  try {
    const { userId } = auth()
    const body = await req.json()
    const { name, value } = body

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!name || !value) {
      return new NextResponse(`${!name ? 'Name' : 'Value'} is required `, { status: 400 })
    }

    if (!params.colorId) {
      return new NextResponse('Color id is required', { status: 400 })
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

    const color = await prismadb.color.updateMany({
      where: {
        id: params.colorId
      },
      data: {
        name,
        value
      }
    })

    return NextResponse.json(color)
  } catch (error) {
    console.log('[COLOR_PATCH', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; colorId: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!params.colorId) {
      return new NextResponse('Color ID is required', { status: 400 })
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

    const color = await prismadb.color.deleteMany({
      where: {
        id: params.colorId
      }
    })

    return NextResponse.json(color)
  } catch (error) {
    console.log('[COLOR_DELETE', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { colorId: string } }) {
  try {
    if (!params.colorId) {
      return new NextResponse('Color ID is required', { status: 400 })
    }

    const color = await prismadb.color.findUnique({
      where: {
        id: params.colorId
      }
    })

    return NextResponse.json(color)
  } catch (error) {
    console.log('[COLOR_GET', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
