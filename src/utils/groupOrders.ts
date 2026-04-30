import firebaseClient from "@config/firebaseClient"

export interface GroupItem {
  id: number
  name: string
  price: number
  qty: number
}

export interface GroupMember {
  name: string
  initial: string
  colorIndex: number
  items: GroupItem[]
  joinedAt: number
  paid?: boolean
}

export interface GroupOrder {
  id: string
  title: string
  organizer: { uid: string; name: string }
  status: "active" | "closed"
  createdAt: number
  members: Record<string, GroupMember>
}

export const AVATAR_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-600 dark:text-blue-400" },
  { bg: "bg-pink-100 dark:bg-pink-900/40", text: "text-pink-600 dark:text-pink-400" },
  { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-600 dark:text-purple-400" },
  { bg: "bg-yellow-100 dark:bg-yellow-900/40", text: "text-yellow-600 dark:text-yellow-400" },
  { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-600 dark:text-green-400" },
  { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-600 dark:text-orange-400" },
]

function getMemberName(user: any): string {
  return user.displayName || user.email?.split("@")[0] || "成員"
}

export async function createGroup(user: any): Promise<string> {
  const db = firebaseClient.database()
  const ref = db.ref("groups").push()
  const name = getMemberName(user)

  await ref.set({
    title: "揪團點餐",
    organizer: { uid: user.uid, name },
    status: "active",
    createdAt: Date.now(),
    members: {
      [user.uid]: {
        name,
        initial: name[0].toUpperCase(),
        colorIndex: 0,
        items: [],
        joinedAt: Date.now(),
      },
    },
  })

  return ref.key!
}

export async function joinGroup(groupId: string, user: any, existingMemberCount: number) {
  const db = firebaseClient.database()
  const name = getMemberName(user)
  await db.ref(`groups/${groupId}/members/${user.uid}`).set({
    name,
    initial: name[0].toUpperCase(),
    colorIndex: existingMemberCount % AVATAR_COLORS.length,
    items: [],
    joinedAt: Date.now(),
  })
}

export async function updateMemberItems(groupId: string, uid: string, items: GroupItem[]) {
  const db = firebaseClient.database()
  await db.ref(`groups/${groupId}/members/${uid}/items`).set(items.length > 0 ? items : null)
}

export async function updatePaymentStatus(groupId: string, uid: string, paid: boolean) {
  const db = firebaseClient.database()
  await db.ref(`groups/${groupId}/members/${uid}/paid`).set(paid)
}

export async function closeGroup(groupId: string) {
  const db = firebaseClient.database()
  await db.ref(`groups/${groupId}/status`).set("closed")
}

export interface OrderRecord {
  id: string
  groupId: string
  title: string
  organizerName: string
  myItems: GroupItem[]
  myTotal: number
  grandTotal: number
  memberCount: number
  closedAt: number
}

export async function saveOrderHistory(group: GroupOrder, groupId: string): Promise<void> {
  const db = firebaseClient.database()
  const grandTotal = Object.values(group.members).reduce(
    (s, m) => s + m.items.reduce((ss, i) => ss + i.price * i.qty, 0), 0
  )
  const memberCount = Object.keys(group.members).length
  const closedAt = Date.now()

  await Promise.all(
    Object.entries(group.members).map(([uid, member]) => {
      const myTotal = member.items.reduce((s, i) => s + i.price * i.qty, 0)
      return db.ref(`userOrders/${uid}`).push({
        groupId,
        title: group.title,
        organizerName: group.organizer.name,
        myItems: member.items.length > 0 ? member.items : [],
        myTotal,
        grandTotal,
        memberCount,
        closedAt,
      })
    })
  )
}

export async function saveIndividualOrder(
  user: any,
  cartItems: Array<{ id: number; name: string; price: number; qty: number }>,
  finalTotal: number
): Promise<void> {
  const db = firebaseClient.database()
  const name = getMemberName(user)
  await db.ref(`userOrders/${user.uid}`).push({
    groupId: "",
    title: "個人訂單",
    organizerName: name,
    myItems: cartItems.length > 0 ? cartItems.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })) : null,
    myTotal: finalTotal,
    grandTotal: finalTotal,
    memberCount: 1,
    closedAt: Date.now(),
  })
}

export function subscribeToUserOrders(
  uid: string,
  onData: (orders: OrderRecord[]) => void
): () => void {
  const db = firebaseClient.database()
  const ref = db.ref(`userOrders/${uid}`)

  const handler = (snapshot: any) => {
    if (!snapshot.exists()) { onData([]); return }
    const val = snapshot.val()
    const orders: OrderRecord[] = Object.entries(val)
      .map(([id, data]: [string, any]) => ({ id, ...data }))
      .sort((a, b) => b.closedAt - a.closedAt)
    onData(orders)
  }

  ref.on("value", handler)
  return () => ref.off("value", handler)
}

export function subscribeToGroup(
  groupId: string,
  onData: (group: GroupOrder | null) => void,
  onError?: (err: Error) => void
): () => void {
  const db = firebaseClient.database()
  const ref = db.ref(`groups/${groupId}`)

  const handler = (snapshot: any) => {
    if (snapshot.exists()) {
      const data = snapshot.val()
      if (data.members) {
        Object.keys(data.members).forEach(uid => {
          if (!data.members[uid].items) data.members[uid].items = []
        })
      }
      onData({ id: groupId, ...data })
    } else {
      onData(null)
    }
  }

  const errorHandler = (err: any) => {
    console.error("[subscribeToGroup] error:", err.code, err.message)
    if (onError) onError(err)
  }

  ref.on("value", handler, errorHandler)
  return () => ref.off("value", handler)
}
