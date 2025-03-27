// app/api/appointments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Appointment Update Schema
const AppointmentUpdateSchema = z.object({
  doctorId: z.string().optional(),
  ambulanceId: z.string().optional(),
  dateTime: z.string().datetime().optional(),
  condition: z.string().optional(),
  specialization: z.string().optional(),
  status: z.enum(['NEW', 'PENDING', 'COMPLETED', 'CANCELED', 'EMERGENCY']).optional(),
  comments: z.string().optional(),
  description: z.string().optional(),
  prescriptions: z.array(z.string()).optional(),
  tests: z.array(z.string()).optional(),
  relatedAppointmentId: z.string().optional()
})

export async function GET(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        ambulance: true,
        relatedAppointments: true,
        relatedTo: true
      }
    })

    if (!appointment) {
      return NextResponse.json({ 
        error: 'Appointment not found' 
      }, { status: 404 })
    }

    return NextResponse.json(appointment)
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json()

    const validation = AppointmentUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error.errors 
      }, { status: 400 })
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(body.doctorId && { doctor: { connect: { id: body.doctorId } } }),
        ...(body.ambulanceId && { ambulance: { connect: { id: body.ambulanceId } } }),
        ...(body.relatedAppointmentId && { 
          relatedTo: { connect: { id: body.relatedAppointmentId } } 
        }),
        dateTime: body.dateTime ? new Date(body.dateTime) : undefined,
        condition: body.condition,
        specialization: body.specialization,
        status: body.status,
        comments: body.comments,
        description: body.description,
        prescriptions: body.prescriptions,
        tests: body.tests
      },
      include: {
        patient: true,
        doctor: true,
        ambulance: true
      }
    })

    return NextResponse.json(appointment)
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const relatedAppointments = await prisma.appointment.findMany({
      where: {
        relatedTo: { some: { id } },
      },
      select: { id: true },
    })
    
    for (const related of relatedAppointments) {
      await prisma.appointment.update({
        where: { id: related.id },
        data: {
          relatedTo: {
            disconnect: { id },
          },
        },
      })
    }

    await prisma.appointment.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Appointment deleted successfully' 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}