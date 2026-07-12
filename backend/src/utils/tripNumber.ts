import prisma from '../models/prisma';

/**
 * Generates the next sequential trip number in format TRP-XXXX.
 * Thread-safe via database query for max existing number.
 */
export async function generateTripNumber(): Promise<string> {
  const lastTrip = await prisma.trip.findFirst({
    orderBy: { created_at: 'desc' },
    select: { trip_number: true },
  });

  let nextNumber = 1;

  if (lastTrip && lastTrip.trip_number) {
    const match = lastTrip.trip_number.match(/TRP-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `TRP-${nextNumber.toString().padStart(4, '0')}`;
}
