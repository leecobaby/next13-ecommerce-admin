import prismadb from '@/lib/prismadb';

export const getTotalRevenue = async (storeId: string) => {
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        }
      }
    }
  });

  const totalRevenue = paidOrders.reduce((acc, order) => {
    const orderTotal = order.orderItems.reduce((orderTotal, item) => {
      return orderTotal + item.product.price.toNumber();
    }, 0);

    return acc + orderTotal;
  }, 0);

  return totalRevenue;
}