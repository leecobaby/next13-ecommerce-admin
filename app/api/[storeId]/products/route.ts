import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

import prismadb from '@/lib/prismadb'

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = auth()
    const body = await req.json()
    const { name, price, categoryId, colorId, sizeId, images, isFeatured, isArchived
    } = body

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!name || !price || !categoryId || !colorId || !sizeId) {
      return new NextResponse(`${!name ? 'Name' : !price ? 'Price' : !categoryId ? 'Category' : !colorId ? 'Color' : 'Size'} is required `, { status: 400 })
    }

    if (!images || !images.length) {
      return new NextResponse('Image is required', { status: 400 })
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

    const product = await prismadb.product.create({
      data: {
        name,
        price,
        categoryId,
        colorId,
        sizeId,
        isFeatured,
        isArchived,
        storeId: params.storeId,
        images: {
          createMany: {
            data: images.map((image: { url: string }) => image)
          }
        }
      }
    })

    return NextResponse.json(product)
  } catch (e) {
    console.log('[PRODUCT_POST]', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId') || undefined
    const colorId = searchParams.get('colorId') || undefined
    const sizeId = searchParams.get('sizeId') || undefined
    const isFeatured = searchParams.get('isFeatured')

    if (!params.storeId) {
      return new NextResponse('Store id is required', { status: 400 })
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        colorId,
        sizeId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false
      },
      include: {
        images: true,
        category: true,
        color: true,
        size: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(products)
  } catch (e) {
    console.log('[PRODUCT_GET]', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
