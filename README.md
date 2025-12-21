# Empire.io (MVP)

A minimalist, multiplayer strategy game where empires breathe, consume, and collapse. Build a sprawling civilization on a hexagonal grid, manage tight resource chains, and lead AI armies through a unique "Hegemon & Vassal" system.

## 1. The Core Loop

* **Expand:** Every building must touch your existing frontier.
* **Sustain:** Every tile costs **Food**. Every army costs **Gold**. Every defense costs **Stone**.
* **Conquer:** You do not control units. You place a **Target Marker**, and your AI camps automatically send troops to that location.

## 2. Key Mechanics

### The Hegemon System

* **Automatic Attachment:** New players (Vassals) are automatically tethered to the nearest large empire (Hegemon).
* **Protection:** Hegemons can build **Garrison Camps** inside Vassal territory to defend them.
* **Independence:** Once a Vassal grows large enough, they can "Rebel." When they do, they **steal** all Garrison Camps currently on their land.

### Resource Hierarchy

| Building | Input | Output | Purpose |
| --- | --- | --- | --- |
| **Farm** | Space | 3 Food | Each tile you own consumes 1 Food. No food = Tile Decay. |
| **Market** | Space | Gold | Pays for AI army upkeep. No gold = Armies stop moving. |
| **Mine** | Mountain | Stone | Used to build and repair Watch Towers and Castles. |
| **Camps** | Gold | AI Units | Automatically spawns Infantry, Archers, or Cavalry. |

### AI Warfare

* Players have **one** Target Marker.
* AI units move procedurally toward the marker.
* **Strategy:** If a small player cuts off a Hegemon’s Farm or Market, it triggers a **Snowball Collapse**, where the large empire loses the ability to feed its tiles or pay its soldiers.

## 3. Controls

* **Left Click:** Select building / Place building on hex.
* **Right Click:** Place "Target Marker" for AI armies.
* **Scroll:** Zoom in/out of the map.
* **Button [I]:** Claim Independence (Only available to Vassals).

## 5. Winning Condition

There is no "end." Survival is the goal. Your score is based on the **Total Land Area** and **Number of Vassals** currently under your protection.
