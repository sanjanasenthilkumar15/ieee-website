import { groq } from "next-sanity";

/**
 * GROQ queries. Each projection returns the exact shapes in types.ts, so the
 * Sanity path and the offline JSON path are interchangeable.
 */

const img = (field: string) => `${field}{
  "url": asset->url,
  "alt": coalesce(alt, ""),
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip
}`;

export const siteSettingsQuery = groq`*[_id == "siteSettings"][0]{
  branchName, branchCode, tagline, establishedYear, vision, mission,
  "objectives": coalesce(objectives, []),
  "stats": coalesce(stats, {}),
  "milestones": coalesce(milestones[]{year, title, description}, []),
  "recognitions": coalesce(recognitions[]{title, awardedBy, year}, []),
  contactEmail, contactPhone, address, mapUrl,
  "social": coalesce(social, {}),
  "mediaCoverage": coalesce(mediaCoverage[]{title, outlet, date, url}, [])
}`;

export const societiesQuery = groq`*[_type == "society"] | order(coalesce(order, 999) asc, name asc){
  "id": _id, name, shortName, kind, description, website,
  "logo": ${img("logo")}
}`;

export const execomQuery = groq`*[_type == "execomMember"] | order(year desc, coalesce(order, 999) asc, name asc){
  "id": _id, name, year, role, memberType, section, order, department, yearOfStudy, linkedin, ieeeProfile,
  "photo": ${img("photo")}
}`;

const eventCard = `
  "id": _id, "slug": slug.current, title, seriesLabel, eventType, startDate, endDate,
  "hideTime": coalesce(hideTime, false), mode, venue, summary, "featured": coalesce(featured, false),
  "societies": coalesce(societies[]->{ "id": _id, name, shortName }, []),
  "poster": ${img("poster")},
  "speakers": coalesce(speakers[]{ name, designation, affiliation, role, "photo": ${img("photo")} }, [])
`;

export const eventsQuery = groq`*[_type == "event" && defined(slug.current)] | order(startDate desc){ ${eventCard} }`;

export const eventBySlugQuery = groq`*[_type == "event" && slug.current == $slug][0]{
  ${eventCard},
  description, objective,
  "agenda": coalesce(agenda[]{time, title, detail}, []),
  registrationUrl, joinUrl, recordingUrl, socialPostUrl,
  report, "reportFileUrl": reportFile.asset->url, attendance
}`;

export const eventSlugsQuery = groq`*[_type == "event" && defined(slug.current)].slug.current`;

export const achievementsQuery = groq`*[_type == "achievement"] | order(date desc){
  "id": _id, title, category, memberName, department, yearOfStudy, organizer, position, projectTitle, date,
  "featured": coalesce(featured, false),
  "photo": ${img("photo")},
  "proofUrl": select(showProof == true => proof.asset->url, null)
}`;

export const publicationsQuery = groq`*[_type == "publication"] | order(year desc, title asc){
  "id": _id, title, "authors": coalesce(authors, []), venueType, venue, year, doi, link, researchArea, abstract
}`;

const postCard = `
  "id": _id, "slug": slug.current, title, type, author, date, excerpt,
  "coverImage": ${img("coverImage")}
`;

export const postsQuery = groq`*[_type == "post" && defined(slug.current)] | order(date desc){ ${postCard} }`;

export const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0]{
  ${postCard}, body,
  "attachmentUrl": attachment.asset->url,
  "attachmentName": attachment.asset->originalFilename,
  "relatedEvent": relatedEvent->{ "slug": slug.current, title }
}`;

export const postSlugsQuery = groq`*[_type == "post" && defined(slug.current)].slug.current`;

export const albumsQuery = groq`*[_type == "galleryAlbum"] | order(date desc){
  "id": _id, "slug": slug.current, title, date,
  "event": event->{ "slug": slug.current, title },
  "photos": coalesce(photos[]{
    "url": asset->url, "alt": coalesce(alt, ""), caption,
    "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height,
    "lqip": asset->metadata.lqip
  }, []),
  "videos": coalesce(videos[]{title, url}, [])
}`;
