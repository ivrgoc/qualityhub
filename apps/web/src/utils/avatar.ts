/**
 * Extracts initials from a name string.
 * Returns up to 2 characters from the first and last name.
 *
 * @example
 * getInitials('John') // 'J'
 * getInitials('John Doe') // 'JD'
 * getInitials('John William Doe') // 'JD'
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
