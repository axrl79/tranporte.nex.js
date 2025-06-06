import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { maintenances } from "@/db/schema";
import { eq } from "drizzle-orm";

// Función auxiliar para validar fechas
function isValidDate(date: any): boolean {
  const d = new Date(date);
  return !isNaN(d.getTime());
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const maintenanceId = params.id;

    const maintenance = await db.query.maintenances.findFirst({
      where: (maintenances, { eq }) => eq(maintenances.id, maintenanceId),
      with: {
        vehicle: true,
        technician: true,
      },
    });

    if (!maintenance) {
      return NextResponse.json({ error: "Mantenimiento no encontrado" }, { status: 404 });
    }

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error("Error al obtener mantenimiento:", error);
    return NextResponse.json({ error: "Error al obtener el mantenimiento" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const maintenanceId = params.id;
    const body = await request.json();

    // Verificar si el mantenimiento existe
    const existingMaintenance = await db.query.maintenances.findFirst({
      where: (maintenances, { eq }) => eq(maintenances.id, maintenanceId),
    });

    if (!existingMaintenance) {
      return NextResponse.json({ error: "Mantenimiento no encontrado" }, { status: 404 });
    }

    // Preparar los datos para actualizar
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Solo incluir los campos que se están actualizando
    if (body.type !== undefined) updateData.type = body.type;
    if (body.description !== undefined) updateData.description = body.description;

    if (body.scheduledDate !== undefined && isValidDate(body.scheduledDate)) {
      updateData.scheduledDate = new Date(body.scheduledDate);
    }

    if (body.completedDate !== undefined && isValidDate(body.completedDate)) {
      updateData.completedDate = new Date(body.completedDate);
    }

    if (body.cost !== undefined) updateData.cost = body.cost;
    if (body.technicianId !== undefined) updateData.technicianId = body.technicianId;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;

    // Actualizar el mantenimiento
    const updatedMaintenance = await db
      .update(maintenances)
      .set(updateData)
      .where(eq(maintenances.id, maintenanceId))
      .returning();

    return NextResponse.json(updatedMaintenance[0]);
  } catch (error) {
    console.error("Error al actualizar mantenimiento:", error);
    return NextResponse.json({ error: "Error al actualizar el mantenimiento" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const maintenanceId = params.id;

    // Verificar si el mantenimiento existe
    const existingMaintenance = await db.query.maintenances.findFirst({
      where: (maintenances, { eq }) => eq(maintenances.id, maintenanceId),
    });

    if (!existingMaintenance) {
      return NextResponse.json({ error: "Mantenimiento no encontrado" }, { status: 404 });
    }

    // Verificar si el mantenimiento puede ser eliminado
    if (existingMaintenance.status === "completado") {
      return NextResponse.json(
        { error: "No se puede eliminar un mantenimiento completado" },
        { status: 400 }
      );
    }

    // Eliminar el mantenimiento
    await db.delete(maintenances).where(eq(maintenances.id, maintenanceId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar mantenimiento:", error);
    return NextResponse.json({ error: "Error al eliminar el mantenimiento" }, { status: 500 });
  }
}
