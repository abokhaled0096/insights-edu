
import SettingsPage from "@/components/settings-client";

import {
  getSettingsAction,
} from "@/app/actions/settings";

export default async function Page() {
  const user =
    await getSettingsAction();

  return (
    <div className="p-6">
      <SettingsPage
        user={user}
      />
    </div>
  );
}