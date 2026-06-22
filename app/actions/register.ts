"use server";

// Public registration is DISABLED.
// All user accounts are provisioned exclusively by the Admin portal.
export async function registerUser(_values: any) {
  return { error: "التسجيل العام مغلق. يتم إنشاء الحسابات من قبل مسؤول النظام فقط." };
}
