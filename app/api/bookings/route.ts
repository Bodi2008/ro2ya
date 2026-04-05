import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, 'bookings'));
    const bookings = querySnapshot.docs.map(doc => doc.data());
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ bookings: [] });
  }
}

export async function POST(request: Request) {
  try {
    const booking = await request.json();
    
    // Fetch existing bookings to check for double booking
    const querySnapshot = await getDocs(collection(db, 'bookings'));
    const bookings = querySnapshot.docs.map(doc => doc.data());
    
    // Check for double booking
    const isTaken = bookings.some(
      (b: any) => 
        b.date === booking.date && 
        b.time === booking.time && 
        b.status !== 'cancelled' &&
        b.sessionType === booking.sessionType &&
        (booking.sessionType === 'online' || (b.country === booking.country && (booking.sessionType !== 'in-center' || b.location === booking.location)))
    );
    
    if (isTaken) {
      return NextResponse.json({ error: 'This time slot is already booked.' }, { status: 400 });
    }
    
    const newBooking = {
      ...booking,
      id: Math.random().toString(36).substring(2, 9),
      referenceNumber: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
      status: booking.status || 'pending',
    };
    
    await setDoc(doc(db, 'bookings', newBooking.id), newBooking);
    return NextResponse.json({ booking: newBooking }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedData = await request.json();
    if (!updatedData.id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    
    const bookingRef = doc(db, 'bookings', updatedData.id);
    await updateDoc(bookingRef, updatedData);
    
    return NextResponse.json({ booking: updatedData });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    
    await deleteDoc(doc(db, 'bookings', id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
