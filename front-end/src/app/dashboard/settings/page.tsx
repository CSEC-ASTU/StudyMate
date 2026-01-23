"use client";

import { Bell, Lock, Moon, Globe, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <div className="max-w-2xl space-y-6">
        {/* Notifications */}
        <Card className="border-border bg-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">
                  Email Notifications
                </p>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">
                  Push Notifications
                </p>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">Course Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Get reminded before classes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border-border bg-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Moon className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Customize the look and feel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  Switch to dark theme
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="border-border bg-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Globe className="h-5 w-5" />
              Language & Region
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Set your preferred language
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">Language</p>
                <p className="text-sm text-muted-foreground">English (US)</p>
              </div>
              <Button
                variant="outline"
                className="border-border text-foreground bg-transparent"
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-border bg-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage your account security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">Change Password</p>
                <p className="text-sm text-muted-foreground">
                  Update your password
                </p>
              </div>
              <Button
                variant="outline"
                className="border-border text-foreground bg-transparent"
              >
                <Lock className="mr-2 h-4 w-4" />
                Update
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">Two-Factor Auth</p>
                <p className="text-sm text-muted-foreground">
                  Add extra security
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50 bg-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <LogOut className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Irreversible actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full sm:w-auto">
              Sign Out of All Devices
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
