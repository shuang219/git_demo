import { Router, Request, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { safetyRepository } from '../repositories/safety';
import {
  createContactRequestSchema,
  createSosRequestSchema,
  EmergencyContactRow,
  SosEventRow,
} from '../db/schema';
import {
  ApiResponse,
  EmergencyContact,
  SosEvent,
  SosResponse,
} from '../../shared/types/api';

const router = Router();

router.use(authenticateJWT);

const toContact = (row: EmergencyContactRow): EmergencyContact => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  relationship: row.relationship,
  createdAt: row.createdAt.toISOString(),
});

const toSosEvent = (row: SosEventRow): SosEvent => ({
  id: row.id,
  message: row.message,
  latitude: row.latitude,
  longitude: row.longitude,
  contactCount: row.contactCount,
  createdAt: row.createdAt.toISOString(),
});

const getUserId = (req: Request) => (req as AuthRequest).user!.id;

router.get('/contacts', async (req: Request, res: Response) => {
  try {
    const rows = await safetyRepository.listContacts(getUserId(req));
    const body: ApiResponse<EmergencyContact[]> = {
      success: true,
      data: rows.map(toContact),
    };
    res.json(body);
  } catch (error) {
    console.error('Error in list contacts:', error);
    res.status(500).json({ success: false, message: '获取联系人失败' });
  }
});

router.post('/contacts', async (req: Request, res: Response) => {
  try {
    const parsed = createContactRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || '参数无效',
      });
    }
    const row = await safetyRepository.createContact({
      ...parsed.data,
      userId: getUserId(req),
    });
    const body: ApiResponse<EmergencyContact> = {
      success: true,
      data: toContact(row),
    };
    return res.status(201).json(body);
  } catch (error) {
    console.error('Error in create contact:', error);
    return res.status(500).json({ success: false, message: '添加联系人失败' });
  }
});

router.delete('/contacts/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const removed = await safetyRepository.deleteContact(getUserId(req), id);
    if (!removed) {
      return res.status(404).json({ success: false, message: '联系人不存在' });
    }
    return res.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Error in delete contact:', error);
    return res.status(500).json({ success: false, message: '删除联系人失败' });
  }
});

router.get('/sos', async (req: Request, res: Response) => {
  try {
    const rows = await safetyRepository.listSosEvents(getUserId(req));
    const body: ApiResponse<SosEvent[]> = {
      success: true,
      data: rows.map(toSosEvent),
    };
    res.json(body);
  } catch (error) {
    console.error('Error in list sos events:', error);
    res.status(500).json({ success: false, message: '获取求助记录失败' });
  }
});

router.post('/sos', async (req: Request, res: Response) => {
  try {
    const parsed = createSosRequestSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || '参数无效',
      });
    }
    const userId = getUserId(req);
    const contacts = await safetyRepository.listContacts(userId);
    const { message, latitude, longitude } = parsed.data;
    const row = await safetyRepository.createSosEvent({
      userId,
      message: message || 'SOS 紧急求助',
      latitude: latitude !== undefined ? String(latitude) : null,
      longitude: longitude !== undefined ? String(longitude) : null,
      contactCount: contacts.length,
    });
    const body: ApiResponse<SosResponse> = {
      success: true,
      data: { event: toSosEvent(row), notified: contacts.map((c) => c.name) },
    };
    return res.status(201).json(body);
  } catch (error) {
    console.error('Error in create sos event:', error);
    return res.status(500).json({ success: false, message: '发送求助失败' });
  }
});

export default router;
