// app/profile/page.tsx

import ProfilePage from "@/components/profile-client";

import {
  getProfileAction,
} from "@/app/actions/profile";

export default async function Page() {
  const user =
    await getProfileAction();

  return (
    <div className="p-6">
      <ProfilePage
        user={user}
      />
    </div>
  );
}