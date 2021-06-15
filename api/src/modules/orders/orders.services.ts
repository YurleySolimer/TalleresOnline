import Order from './Orders.model'
import * as clientCtrl from '../clients/clients.services'
import * as carsCtrl from '../cars/cars.services'

export async function createOrder(
  data: any,
  client: any,
  car: any
): Promise<Document | null> {
  try {
    const newOT = {
      category: data.category,
      subtotal: data.subtotal,
      iva: data.iva,
      total: data.total,
      user: data.userId,
      local: data.local,
      orderNum: data.orderNum,
      services: data.services,
      client: client._id,
      car: car._id,
    }

    const order = new Order(newOT)
    const savedOrder = await order.save()
    return savedOrder
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function getOrder(orderId: string): Promise<Document | null> {
  try {
    const order = await Order.findById(orderId)
    if (!order) {
      return null
    }
    return order
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function getOrders(): Promise<Document> {
  try {
    const orders = await Order.find()
                        .populate({ path: 'client', select: {'email': 1, 'name': 1, 'lastname': 1, 'address': 1, 'ruc': 1, '_id': 1 } })
                        .populate('car')
    return orders
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function deleteOrder(orderId: string): Promise<Document | null> {
  try {
    const order = await Order.findById(orderId)
    if (!order) {
      return null
    }
    const car = await carsCtrl.deleteCar(order.car)
    const client = await clientCtrl.deleteClient(order.client)
    const orderDelete = await Order.deleteOne({ _id: orderId })

    return orderDelete
  } catch (error) {
    return Promise.reject(error)
  }
}
export async function updateOrder(
  data: any,
  orderId: string,
  file: any
): Promise<Document | null> {
  try {
    const order = await Order.findById(orderId)
    if (!order) {
      return null
    }
    const car = await carsCtrl.updateCar(order.car, file, data)
    const client = await clientCtrl.updateClient(data, order.client)
    const orderUpdate = await Order.updateOne({ _id: orderId, data })
    return orderUpdate
  } catch (error) {
    return Promise.reject(error)
  }
}
