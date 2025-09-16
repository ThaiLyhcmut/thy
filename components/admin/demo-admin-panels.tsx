"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wheat, Layers, CreditCard, Settings, DollarSign, Clock, Plus, Users } from "lucide-react"
import { AlertCircle } from "lucide-react"

export function DemoAdminPanels() {
  return (
    <div className="space-y-6">
      {/* Demo Notice */}
      <Alert className="border-blue-500/20 bg-blue-500/5">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          <strong>Demo Mode:</strong> These admin panels are shown for demonstration. 
          You would need to be the owner of each contract to use these functions in production.
        </AlertDescription>
      </Alert>

      {/* Liquidity Mining Admin Demo */}
      <Card className="bg-card border-border border-2 border-green-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wheat className="h-5 w-5 text-green-500" />
              <CardTitle className="text-card-foreground">Liquidity Mining Admin</CardTitle>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              Demo Mode
            </Badge>
          </div>
          <CardDescription className="text-muted-foreground">
            Configure liquidity mining parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="rewards" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
              <TabsTrigger value="pool">Pool Config</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
            </TabsList>

            <TabsContent value="rewards" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-card-foreground">Reward Per Block (THY)</Label>
                <Input placeholder="0.0" disabled className="bg-input border-border text-foreground" />
                <Button disabled className="w-full gap-2">
                  <DollarSign className="h-4 w-4" />
                  Update Reward Rate
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground">Bonus Multiplier (e.g., 2 for 2x)</Label>
                <Input placeholder="1" disabled className="bg-input border-border text-foreground" />
                <Button disabled variant="secondary" className="w-full gap-2">
                  <Clock className="h-4 w-4" />
                  Set Bonus Multiplier
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="pool" className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Allocation Points</Label>
                  <Input placeholder="100" disabled className="bg-input border-border text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Deposit Fee (BP)</Label>
                  <Input placeholder="0" disabled className="bg-input border-border text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Withdraw Fee (BP)</Label>
                  <Input placeholder="0" disabled className="bg-input border-border text-foreground" />
                </div>
              </div>
              <Button disabled className="w-full gap-2">
                <Settings className="h-4 w-4" />
                Update Pool Configuration
              </Button>
            </TabsContent>

            <TabsContent value="emergency" className="space-y-4">
              <div className="p-4 rounded-lg bg-destructive/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-card-foreground">Emergency Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Allows users to withdraw without rewards calculation
                    </p>
                  </div>
                  <Switch disabled />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Staking Admin Demo */}
      <Card className="bg-card border-border border-2 border-blue-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-card-foreground">Staking Admin</CardTitle>
            </div>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              Demo Mode
            </Badge>
          </div>
          <CardDescription className="text-muted-foreground">
            Manage staking pools and parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Create Pool</TabsTrigger>
              <TabsTrigger value="update">Update Pool</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-card-foreground">Lock Period (Days)</Label>
                <Input placeholder="30" disabled className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Reward Rate (% APY)</Label>
                <Input placeholder="15" disabled className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Minimum Stake Amount (THY)</Label>
                <Input placeholder="100" disabled className="bg-input border-border text-foreground" />
              </div>
              <Button disabled className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Create New Pool
              </Button>
            </TabsContent>

            <TabsContent value="update" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-card-foreground">Pool ID</Label>
                <Input placeholder="0" disabled className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">New Reward Rate (% APY)</Label>
                <Input placeholder="20" disabled className="bg-input border-border text-foreground" />
              </div>
              <Button disabled className="w-full gap-2">
                <Settings className="h-4 w-4" />
                Update Pool
              </Button>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-card-foreground">Early Withdraw Penalty (%)</Label>
                <Input placeholder="25" disabled className="bg-input border-border text-foreground" />
                <p className="text-xs text-muted-foreground">
                  Current default is 25%. This applies when users withdraw before lock period ends.
                </p>
              </div>
              <Button disabled variant="destructive" className="w-full">
                Update Penalty
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payment Gateway Admin Demo */}
      <Card className="bg-card border-border border-2 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-card-foreground">Payment Gateway Admin</CardTitle>
            </div>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
              Demo Mode
            </Badge>
          </div>
          <CardDescription className="text-muted-foreground">
            Manage payment fees and merchants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fees" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fees">Fee Management</TabsTrigger>
              <TabsTrigger value="merchants">Merchants</TabsTrigger>
            </TabsList>

            <TabsContent value="fees" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-card-foreground">Token Address</Label>
                <Input placeholder="0x..." disabled className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Fee Rate (%)</Label>
                <Input placeholder="1.5" disabled className="bg-input border-border text-foreground" />
              </div>
              <Button disabled className="w-full gap-2">
                <DollarSign className="h-4 w-4" />
                Set Fee Rate
              </Button>
            </TabsContent>

            <TabsContent value="merchants" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-card-foreground">Merchant ID</Label>
                <Input placeholder="1" disabled className="bg-input border-border text-foreground" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-card-foreground">Merchant Status</p>
                  <p className="text-sm text-muted-foreground">Enable or disable merchant</p>
                </div>
                <Switch disabled />
              </div>
              <Button disabled className="w-full gap-2">
                <Users className="h-4 w-4" />
                Update Merchant Status
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}