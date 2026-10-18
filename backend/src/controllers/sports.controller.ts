import { Request, Response } from 'express';

export const listSportsEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = [
      {
        id: 'evt-cricket-2026',
        name: 'Inter-House Cricket Championship 2026',
        sport: 'Cricket',
        category: 'Inter-House',
        fee: 0,
        registrationDeadline: '2026-11-05',
        status: 'Open',
        slots: { total: 120, registered: 84 },
      },
      {
        id: 'evt-football-2026',
        name: 'State School Football League',
        sport: 'Football',
        category: 'State Championship',
        fee: 500,
        registrationDeadline: '2026-11-12',
        status: 'Open',
        slots: { total: 90, registered: 76 },
      },
    ];

    res.status(200).json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const registerForSport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, studentName, studentId, emergencyContact, preferredPosition } = req.body;

    if (!eventId || !studentName) {
      res.status(400).json({ success: false, message: 'Event ID and Student Name are required' });
      return;
    }

    const registration = {
      id: 'reg-' + Date.now(),
      eventId,
      studentName,
      studentId: studentId || 'STU-DEMO',
      emergencyContact,
      preferredPosition,
      status: 'Confirmed',
      registeredAt: new Date().toISOString(),
    };

    res.status(201).json({ success: true, message: 'Registration submitted successfully', data: registration });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
