"use server"

import { redirect } from 'next/navigation'
import type { OrderTime } from "@/lib/prisma"
import { v4 as uuidv4 } from 'uuid'
import { orderTimeService } from '../services/ordertime.service'
 
export async function createOrderTime(formData: FormData) {
    const orderTime: OrderTime = {
        id: uuidv4(),
        time: formData.get("time") as string,
    }
    orderTimeService.create(orderTime)

    redirect("/admin/ordertimes")
}