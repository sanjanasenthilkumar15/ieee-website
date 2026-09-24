import SiteLayout from "./(site)/layout";
import NotFoundContent from "./(site)/not-found";

/** Global 404 (unknown URLs) — rendered with the normal site header/footer. */
export default function NotFound() {
  return (
    <SiteLayout>
      <NotFoundContent />
    </SiteLayout>
  );
}
