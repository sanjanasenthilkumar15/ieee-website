import { BookIcon } from "@sanity/icons/Book";
import { CalendarIcon } from "@sanity/icons/Calendar";
import { ClockIcon } from "@sanity/icons/Clock";
import { CogIcon } from "@sanity/icons/Cog";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { ImagesIcon } from "@sanity/icons/Images";
import { StarIcon } from "@sanity/icons/Star";
import { TagsIcon } from "@sanity/icons/Tags";
import { UsersIcon } from "@sanity/icons/Users";
import type { StructureResolver } from "sanity/structure";
import { postTypes } from "./schemaTypes/shared";

const FIRST_EXECOM_YEAR = 2026;

/**
 * Studio sidebar. Organised for office bearers rather than developers:
 * settings first, then content in the order it appears on the site,
 * with applications at the bottom.
 */
export const structure: StructureResolver = (S) => {
  // One list per Execom year, from 2026 up to next year, newest first.
  // Grows automatically each year; nothing to edit here.
  const lastYear = new Date().getFullYear() + 1;
  const execomYears = Array.from({ length: lastYear - FIRST_EXECOM_YEAR + 1 }, (_, i) => lastYear - i);

  return S.list()
    .title("IEEE SB RMKEC")
    .items([
      S.listItem()
        .title("Site Settings")
        .icon(CogIcon)
        .child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Site Settings")),

      S.divider(),

      S.listItem()
        .title("Execom Members")
        .icon(UsersIcon)
        .child(
          S.list()
            .title("Execom Members")
            .items([
              ...execomYears.map((year) =>
                S.listItem()
                  .title(`${year} Committee`)
                  .icon(UsersIcon)
                  .child(
                    S.documentTypeList("execomMember")
                      .title(`${year} Committee`)
                      .filter('_type == "execomMember" && year == $year')
                      .params({ year })
                      .defaultOrdering([
                        { field: "order", direction: "asc" },
                        { field: "name", direction: "asc" },
                      ])
                      .initialValueTemplates([
                        S.initialValueTemplateItem("execomMember-by-year", { year }),
                      ]),
                  ),
              ),
              S.divider(),
              S.documentTypeListItem("execomMember").title("All members"),
            ]),
        ),

      S.documentTypeListItem("society").title("Societies & Councils").icon(TagsIcon),

      S.listItem()
        .title("Events")
        .icon(CalendarIcon)
        .child(
          S.list()
            .title("Events")
            .items([
              S.listItem()
                .title("Upcoming")
                .icon(ClockIcon)
                .child(
                  S.documentTypeList("event")
                    .title("Upcoming events")
                    .filter('_type == "event" && coalesce(endDate, startDate) >= now()')
                    .defaultOrdering([{ field: "startDate", direction: "asc" }]),
                ),
              S.listItem()
                .title("Past")
                .icon(CalendarIcon)
                .child(
                  S.documentTypeList("event")
                    .title("Past events")
                    .filter('_type == "event" && coalesce(endDate, startDate) < now()')
                    .defaultOrdering([{ field: "startDate", direction: "desc" }]),
                ),
              S.divider(),
              S.documentTypeListItem("event").title("All events"),
            ]),
        ),

      S.documentTypeListItem("achievement").title("Achievements").icon(StarIcon),
      S.documentTypeListItem("publication").title("Publications").icon(BookIcon),

      S.listItem()
        .title("Blog, Newsletters & Resources")
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title("Posts")
            .items([
              ...postTypes.map((t) =>
                S.listItem()
                  .title(t.title)
                  .icon(DocumentTextIcon)
                  .child(
                    S.documentTypeList("post")
                      .title(t.title)
                      .filter('_type == "post" && type == $type')
                      .params({ type: t.value })
                      .initialValueTemplates([S.initialValueTemplateItem("post-by-type", { type: t.value })]),
                  ),
              ),
              S.divider(),
              S.documentTypeListItem("post").title("All posts"),
            ]),
        ),

      S.documentTypeListItem("galleryAlbum").title("Gallery Albums").icon(ImagesIcon),

      S.divider(),

      S.listItem()
        .title("Membership Applications")
        .icon(EnvelopeIcon)
        .child(
          S.list()
            .title("Membership Applications")
            .items([
              S.listItem()
                .title("New")
                .icon(EnvelopeIcon)
                .child(
                  S.documentTypeList("membershipApplication")
                    .title("New applications")
                    .filter('_type == "membershipApplication" && status == "new"')
                    .defaultOrdering([{ field: "submittedAt", direction: "desc" }]),
                ),
              S.listItem()
                .title("Reviewed")
                .icon(EnvelopeIcon)
                .child(
                  S.documentTypeList("membershipApplication")
                    .title("Reviewed applications")
                    .filter('_type == "membershipApplication" && status == "reviewed"')
                    .defaultOrdering([{ field: "submittedAt", direction: "desc" }]),
                ),
              S.divider(),
              S.documentTypeListItem("membershipApplication").title("All applications"),
            ]),
        ),
    ]);
};
