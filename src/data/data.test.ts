import { describe, expect, it } from "vitest";
import { CHARACTERS } from "./characters";
import { ITEMS } from "./items";
import { LOCATIONS } from "./locations";

describe("data consistency", () => {
  // Guards against the kind of regression we hit when "the Pochacco Energy Pop"
  // appeared in clues but the grid only said "Energy Pop". Clue text uses
  // `name`, UI uses `shortName`, and they must refer to the same gift.
  it("item shortName matches name with leading 'the ' stripped", () => {
    for (const i of ITEMS) {
      expect(i.shortName, `item ${i.id}`).toBe(i.name.replace(/^the /, ""));
    }
  });

  it("location shortName matches name with leading 'the ' stripped", () => {
    for (const l of LOCATIONS) {
      expect(l.shortName, `location ${l.id}`).toBe(l.name.replace(/^the /, ""));
    }
  });

  it("character homeLocation points at a real location id", () => {
    const locIds = new Set(LOCATIONS.map((l) => l.id));
    for (const c of CHARACTERS) {
      expect(locIds.has(c.homeLocation), `character ${c.id}`).toBe(true);
    }
  });

  it("character lovedItems all point at real item ids", () => {
    const itemIds = new Set(ITEMS.map((i) => i.id));
    for (const c of CHARACTERS) {
      for (const lid of c.lovedItems) {
        expect(itemIds.has(lid), `character ${c.id} loves ${lid}`).toBe(true);
      }
    }
  });
});
