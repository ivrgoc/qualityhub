import { Permission } from '../enums/permission.enum';
import { PERMISSIONS_KEY, Permissions } from './permissions.decorator';

describe('Permissions Decorator', () => {
  it('should set PERMISSIONS_KEY metadata with single permission', () => {
    @Permissions(Permission.CREATE_TEST_CASE)
    class TestClass {}

    const metadata = Reflect.getMetadata(PERMISSIONS_KEY, TestClass);
    expect(metadata).toEqual([Permission.CREATE_TEST_CASE]);
  });

  it('should set PERMISSIONS_KEY metadata with multiple permissions', () => {
    @Permissions(Permission.CREATE_TEST_CASE, Permission.UPDATE_TEST_CASE)
    class TestClass {}

    const metadata = Reflect.getMetadata(PERMISSIONS_KEY, TestClass);
    expect(metadata).toEqual([
      Permission.CREATE_TEST_CASE,
      Permission.UPDATE_TEST_CASE,
    ]);
  });

  it('should set metadata on method when applied to method', () => {
    class TestClass {
      @Permissions(Permission.VIEW_PROJECT)
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      PERMISSIONS_KEY,
      TestClass.prototype.testMethod,
    );
    expect(metadata).toEqual([Permission.VIEW_PROJECT]);
  });

  it('should set empty array when no permissions provided', () => {
    @Permissions()
    class TestClass {}

    const metadata = Reflect.getMetadata(PERMISSIONS_KEY, TestClass);
    expect(metadata).toEqual([]);
  });

  it('should export PERMISSIONS_KEY constant', () => {
    expect(PERMISSIONS_KEY).toBe('permissions');
  });
});
