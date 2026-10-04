import type { TeamChart, TeamMember, TeamNode } from '../core/models';

const bySortOrder = (a: TeamMember, b: TeamMember) => a.sort_order - b.sort_order || a.name.localeCompare(b.name);

/**
 * Turns the flat member list into one or more trees for a chart. Anyone whose
 * manager is missing (or in another chart) is treated as top level, so nobody
 * silently disappears from the page.
 */
export function buildTeamTree(members: TeamMember[], team: TeamChart): TeamNode[] {
  const inChart = members.filter((m) => m.team === team);
  const ids = new Set(inChart.map((m) => m.id));
  const kids = new Map<string | null, TeamMember[]>();
  for (const m of inChart) {
    const parent = m.parent_id && ids.has(m.parent_id) ? m.parent_id : null;
    kids.set(parent, [...(kids.get(parent) ?? []), m]);
  }
  const seen = new Set<string>();
  const build = (parent: string | null): TeamNode[] =>
    (kids.get(parent) ?? [])
      .sort(bySortOrder)
      .filter((m) => !seen.has(m.id) && seen.add(m.id))
      .map((member) => ({ member, children: build(member.id) }));
  return build(null);
}

/** Depth-first list with indentation level, for admin tables and dropdowns. */
export function flattenTeamTree(nodes: TeamNode[], depth = 0): { member: TeamMember; depth: number }[] {
  return nodes.flatMap((n) => [{ member: n.member, depth }, ...flattenTeamTree(n.children, depth + 1)]);
}

/** Ids of a member and everyone below them (they can't become that member's manager). */
export function descendantIds(nodes: TeamNode[], id: string): Set<string> {
  const out = new Set<string>();
  const walk = (list: TeamNode[], inside: boolean) => {
    for (const n of list) {
      const hit = inside || n.member.id === id;
      if (hit) out.add(n.member.id);
      walk(n.children, hit);
    }
  };
  walk(nodes, false);
  return out;
}
