const PENDING_ADDRESS_KEY = "medira:pending-address-id";

let pendingAddressId: number | null = null;

export function rememberCreatedAddress(id: number) {
  pendingAddressId = id;
  sessionStorage.setItem(PENDING_ADDRESS_KEY, String(id));
}

export function peekPendingAddressId(): number | null {
  if (pendingAddressId != null) return pendingAddressId;

  const raw = sessionStorage.getItem(PENDING_ADDRESS_KEY);
  if (!raw) return null;

  const id = Number(raw);
  if (!Number.isFinite(id)) {
    sessionStorage.removeItem(PENDING_ADDRESS_KEY);
    return null;
  }

  pendingAddressId = id;
  return id;
}

export function clearPendingAddressId() {
  pendingAddressId = null;
  sessionStorage.removeItem(PENDING_ADDRESS_KEY);
}
