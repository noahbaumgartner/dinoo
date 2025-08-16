"use client";

import type { Area } from "@/lib/prisma/wasm";
import type { ListColumnDef } from "../list";
import List from "../list";
import { updateArea } from "@/lib/actions/area";

export default function AreasList({ columns, areas }: { columns: ListColumnDef<Area>[]; areas: Area[] }) {
    const handleChangeOrder = async (areas: Area[]) => {
        for (let index = 0; index < areas.length; index++) {
            const area = areas[index];
            const formData = new FormData();

            area.index = index + 1;

            formData.append("id", area.id);
            formData.append("name", area.name);
            formData.append("area", area.area);
            formData.append("index", area.index.toString());

            await updateArea(formData, false);
        };
    }

    return (
        <List columns={columns} data={areas} onOrderChangeAction={handleChangeOrder} />
    );
}