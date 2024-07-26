"use server";

import { Suspense } from "react";
import MenuGroups from "../../../lib/components/order/menuGroups.client";
import MenuGroupsLoading from "@/lib/components/order/menuGroups.loading";

export default async function OrderById() {

    return (
        <main className="bg-gray-200 h-screen w-full flex flex-row p-2 space-x-2">
            {/* Sidebar */}
            <div className="h-full w-12 shrink-0">
                <div className="bg-white h-full w-full rounded-lg drop-shadow-md p-1 flex flex-col justify-between">
                    <div className="w-full aspect-square border-[1px] hover:bg-gray-50 border-white active:bg-gray-100 hover:border-gray-300 rounded-md flex items-center justify-center cursor-pointer">

                    </div>
                    <div className="w-full aspect-square rounded-md p-1 hover:bg-gray-50 active:bg-gray-100 border-[1px] border-white hover:border-gray-300 cursor-pointer">
                        <img src="https://media.licdn.com/dms/image/D4E03AQEzlR2sWweJ3w/profile-displayphoto-shrink_200_200/0/1693304718563?e=2147483647&v=beta&t=ukExtEDl-fXZT2txUDT0F58yE0xGwB1h0vJe-XcVok0" alt="Logo"
                            className="w-full h-full overflow-hidden rounded-sm" />
                    </div>
                </div>
            </div>
            {/* OrderList */}
            <div className="shrink-0 w-1/3 min-w-60 max-w-72 text-gray-800">
                <div className="bg-white h-full w-full rounded-lg drop-shadow-md p-1">
                    <div className="px-4 py-2 border-b-[1px] border-gray-200 bg-gray-100 rounded-t-md">
                        <h1 className="font-bold text-md">Bestellübersicht</h1>
                    </div>
                    <div className="overflow-auto max-h-[calc(100vh-4rem)]">
                        <div className="border-b-[1px] text-sm px-4 py-4 flex flex-col space-y-4">
                            <div className="flex flex-row">
                                <span className="font-bold w-12">20x</span>
                                <span className="font-bold">Pommes</span>
                                <span className="ml-auto">CHF 20,00</span>
                            </div>
                            <div className="flex flex-col space-y-2 bg-gray-100 rounded-md px-3 py-2 border-[1px] border-gray-300">
                                <div className="flex flex-row">
                                    <span className="">Ketchup (2x)</span>
                                </div>
                                <div className="flex flex-row">
                                    <span className="">Mayo (1x)</span>
                                </div>
                            </div>
                            <div className="flex flex-row bg-gray-100 hover:bg-gray-200 active:bg-gray-300 cursor-pointer items-center justify-center py-2 rounded-md">
                                Bearbeiten
                            </div>
                        </div>
                        <div className="border-b-[1px] text-sm px-4 py-4 flex flex-col space-y-4">
                            <div className="flex flex-row">
                                <span className="font-bold w-12">1x</span>
                                <span className="font-bold">Bier</span>
                                <span className="ml-auto">CHF 20,00</span>
                            </div>
                            <div className="flex flex-col space-y-2 bg-gray-100 rounded-md px-3 py-2 border-[1px] border-gray-300">
                                <div className="flex flex-row">
                                    <span className="">Glas (1x)</span>
                                </div>
                            </div>
                            <div className="flex flex-row bg-gray-100 items-center justify-center py-2 rounded-md">
                                Bearbeiten
                            </div>
                        </div>
                        <div className="border-b-[1px] text-sm px-4 py-4 flex flex-col space-y-4">
                            <div className="flex flex-row">
                                <span className="font-bold w-12">2x</span>
                                <span className="font-bold">Zack-Zack</span>
                                <span className="ml-auto">CHF 20,00</span>
                            </div>
                            <div className="flex flex-row bg-gray-100 items-center justify-center py-2 rounded-md">
                                Bearbeiten
                            </div>
                        </div>
                        <div className="border-b-[1px] text-sm px-4 py-4 flex flex-col space-y-4">
                            <div className="flex flex-row">
                                <span className="font-bold w-12">2x</span>
                                <span className="font-bold">Zack-Zack</span>
                                <span className="ml-auto">CHF 20,00</span>
                            </div>
                            <div className="flex flex-row bg-gray-100 items-center justify-center py-2 rounded-md">
                                Bearbeiten
                            </div>
                        </div>
                        <div className="border-b-[1px] text-sm px-4 py-4 flex flex-col space-y-4">
                            <div className="flex flex-row">
                                <span className="font-bold w-12">2x</span>
                                <span className="font-bold">Zack-Zack</span>
                                <span className="ml-auto">CHF 20,00</span>
                            </div>
                            <div className="flex flex-row bg-gray-100 items-center justify-center py-2 rounded-md">
                                Bearbeiten
                            </div>
                        </div>
                        <div className="border-b-[1px] text-sm px-4 py-4 flex flex-col space-y-4">
                            <div className="flex flex-row">
                                <span className="font-bold w-12">2x</span>
                                <span className="font-bold">Zack-Zack</span>
                                <span className="ml-auto">CHF 20,00</span>
                            </div>
                            <div className="flex flex-row bg-gray-100 items-center justify-center py-2 rounded-md">
                                Bearbeiten
                            </div>
                        </div>
                        <div className="border-b-[1px] text-sm px-4 py-4 flex flex-col space-y-4">
                            <div className="flex flex-row">
                                <span className="font-bold w-12">2x</span>
                                <span className="font-bold">Zack-Zack</span>
                                <span className="ml-auto">CHF 20,00</span>
                            </div>
                            <div className="flex flex-row bg-gray-100 items-center justify-center py-2 rounded-md">
                                Bearbeiten
                            </div>
                        </div>
                        <div className="text-sm px-4 py-4 flex flex-col space-y-4">
                            <div className="flex flex-row">
                                <span className="font-bold w-12">2x</span>
                                <span className="font-bold">Zack-Zack</span>
                                <span className="ml-auto">CHF 20,00</span>
                            </div>
                            <div className="flex flex-row bg-gray-100 items-center justify-center py-2 rounded-md">
                                Bearbeiten
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Categories */}
            <div className="h-full shrink-0 w-1/5 min-w-40 max-w-56">
                <Suspense fallback={<MenuGroupsLoading />}>
                    <MenuGroups />
                </Suspense>
            </div>
            {/* OrderList */}
            <div className="h-full shrink-0 grow">
                <div className="bg-white h-full rounded-lg drop-shadow-md p-1">
                    <div className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 cursor-pointer p-4 text-sm text-center rounded-md">
                        Flasche
                    </div>
                    <div className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 cursor-pointer p-4 text-sm text-center rounded-md mt-1">
                        Leichte Flasche
                    </div>
                    <div className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 cursor-pointer p-4 text-sm text-center rounded-md mt-1">
                        Saft
                    </div>
                </div>
            </div>
        </main>
    )
}