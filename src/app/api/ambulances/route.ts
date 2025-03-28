// app/api/ambulances/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'

// Ambulance Validation Schema
const AmbulanceSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  image: z.string().optional(),
  status: z.enum(['AVAILABLE', 'ON_DUTY', 'OFF_DUTY', 'UNAVAILABLE']).optional()
})

type PrismaError = Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientUnknownRequestError

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = AmbulanceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error.errors 
      }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)

    const ambulance = await prisma.ambulance.create({
      data: {
        ...body,
        password: hashedPassword
      }
    })

    return NextResponse.json(ambulance, { status: 201 })
<<<<<<< HEAD
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        code: error.code
      }, { status: 400 })
    }
    return NextResponse.json({ 
      error: 'Internal server error' 
=======
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'an unknown error occurred'
    return NextResponse.json({ 
      error: errorMessage
>>>>>>> 5a1d428 (build errors half fixed)
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const ambulances = await prisma.ambulance.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        rating: true,
        appointments: true
      }
    })
    return NextResponse.json(ambulances)
<<<<<<< HEAD
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        code: error.code
      }, { status: 400 })
    }
    return NextResponse.json({ 
      error: 'Internal server error' 
=======
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'an unknown error occurred'
    return NextResponse.json({ 
      error: errorMessage 
>>>>>>> 5a1d428 (build errors half fixed)
    }, { status: 500 })
  }
}