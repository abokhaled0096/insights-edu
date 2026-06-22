"use client";

import { useEffect, useState } from "react";
import { Badge, Button } from "antd";
import { BellOutlined } from "@ant-design/icons";

export default function NotificationBadge() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setUnread(data.unreadCount ?? 0);
        }
      } catch {
        // silent
      }
    };

    fetchCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Badge count={unread} size="small" overflowCount={99}>
      <Button type="text" shape="circle" icon={<BellOutlined />} />
    </Badge>
  );
}
