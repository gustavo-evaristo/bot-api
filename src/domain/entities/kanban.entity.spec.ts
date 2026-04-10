import { describe, it, expect } from 'vitest';
import { KanbanEntity } from './kanban.entity';
import { UUID } from './vos';

const makeKanban = (
  overrides: Partial<ConstructorParameters<typeof KanbanEntity>[0]> = {},
) =>
  new KanbanEntity({
    userId: UUID.generate().toString(),
    title: 'Test Kanban',
    description: 'Test description',
    ...overrides,
  });

describe('KanbanEntity', () => {
  describe('constructor', () => {
    it('should auto-generate id when not provided', () => {
      const kanban = makeKanban();
      expect(kanban.id).toBeInstanceOf(UUID);
    });

    it('should use provided id string', () => {
      const kanban = makeKanban({ id: 'custom-id' });
      expect(kanban.id.toString()).toBe('custom-id');
    });

    it('should default isActive=false and isDeleted=false', () => {
      const kanban = makeKanban();
      expect(kanban.isActive).toBe(false);
      expect(kanban.isDeleted).toBe(false);
    });
  });

  describe('active()', () => {
    it('should activate the kanban when phoneNumber and startNodeId are set', () => {
      const kanban = makeKanban({
        phoneNumber: '5511999999999',
        startNodeId: 'node-1',
      });
      kanban.active();
      expect(kanban.isActive).toBe(true);
    });

    it('should throw when activating without phoneNumber', () => {
      const kanban = makeKanban();
      expect(() => kanban.active()).toThrow(
        'Phone number is required to activate the kanban',
      );
    });

    it('should throw when activating without startNodeId', () => {
      const kanban = makeKanban({ phoneNumber: '5511999999999' });
      expect(() => kanban.active()).toThrow(
        'A start node is required to activate the kanban',
      );
    });
  });

  describe('inactive()', () => {
    it('should deactivate the kanban', () => {
      const kanban = makeKanban({
        phoneNumber: '5511999999999',
        isActive: true,
      });
      kanban.inactive();
      expect(kanban.isActive).toBe(false);
    });
  });

  describe('belongsTo()', () => {
    it('should return true when userId matches', () => {
      const userId = UUID.generate();
      const kanban = makeKanban({ userId: userId.toString() });
      expect(kanban.belongsTo(userId)).toBe(true);
    });

    it('should return false when userId differs', () => {
      const kanban = makeKanban();
      expect(kanban.belongsTo(UUID.generate())).toBe(false);
    });
  });

  describe('update()', () => {
    it('should update title, description and imageUrl', () => {
      const kanban = makeKanban();
      kanban.update({
        title: 'New Title',
        description: 'New Desc',
        imageUrl: 'img.png',
      });
      expect(kanban.title).toBe('New Title');
      expect(kanban.description).toBe('New Desc');
      expect(kanban.imageUrl).toBe('img.png');
    });
  });

  describe('updatePhoneNumber()', () => {
    it('should update the phoneNumber', () => {
      const kanban = makeKanban();
      kanban.updatePhoneNumber('5511888888888');
      expect(kanban.phoneNumber).toBe('5511888888888');
    });
  });

  describe('delete()', () => {
    it('should set isDeleted=true and isActive=false', () => {
      const kanban = makeKanban({
        phoneNumber: '5511999999999',
        isActive: true,
      });
      kanban.delete();
      expect(kanban.isDeleted).toBe(true);
      expect(kanban.isActive).toBe(false);
    });
  });

  describe('duplicate()', () => {
    it('should return a new kanban with same data but no phoneNumber and inactive', () => {
      const kanban = makeKanban({
        phoneNumber: '5511999999999',
        isActive: true,
      });
      const copy = kanban.duplicate();

      expect(copy.title).toBe(kanban.title);
      expect(copy.description).toBe(kanban.description);
      expect(copy.userId.toString()).toBe(kanban.userId.toString());
      expect(copy.isActive).toBe(false);
      expect(copy.isDeleted).toBe(false);
      expect(copy.phoneNumber).toBeNull();
      expect(copy.id.toString()).not.toBe(kanban.id.toString());
    });
  });
});
