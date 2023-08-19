import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

import prismadb from '@/lib/prismadb'

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth()
    const body = await req.json()
    const { name, price, categoryId, colorId, sizeId, images, isFeatured, isArchived
    } = body

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!name || !price || !categoryId || !colorId || !sizeId) {
      return new NextResponse(`${!name ? 'Name' : !price ? 'Price' : !categoryId ? 'Category' : !colorId ? 'Color' : 'Size'} is required `, { status: 400 })
    }

    if (!params.productId) {
      return new NextResponse('Product id is required', { status: 400 })
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

    const product = await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        name,
        price,
        categoryId,
        colorId,
        sizeId,
        isFeatured,
        isArchived,
        images: {
          deleteMany: {},
          createMany: {
            data: images.map((image: { url: string }) => image)
          }
        }
      }
    })

    // const product = await prismadb.product.update({
    //   where: {
    //     id: params.productId
    //   },
    //   data: {
    //     images: {
    //       createMany: {
    //         data: images.map((image: { url: string }) => image)
    //       }
    //     }
    //   }
    // })

    return NextResponse.json(product)
  } catch (error) {
    console.log('[PRODUCT_PATCH', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!params.productId) {
      return new NextResponse('Product ID is required', { status: 400 })
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

    const product = await prismadb.product.deleteMany({
      where: {
        id: params.productId
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.log('[PRODUCT_DELETE', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { productId: string } }) {
  try {
    if (!params.productId) {
      return new NextResponse('Product ID is required', { status: 400 })
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId
      },
      include: {
        images: true,
        category: true,
        color: true,
        size: true
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.log('[PRODUCT_GET', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
