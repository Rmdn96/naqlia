import { getGoogleReviewUrl } from "@/config/site";
import { saveCustomerReviewAction } from "@/features/reviews-quality/actions/reviews-quality.actions";
import { StarRating } from "@/features/reviews-quality/components/star-rating";
import type { CustomerReviewContext } from "@/features/reviews-quality/types/reviews-quality";
import type { AppLocale } from "@/i18n/routing";

export function CustomerReviewForm({
  context,
  locale,
  token,
}: {
  context: CustomerReviewContext;
  locale: AppLocale;
  token: string;
}) {
  const ar = locale === "ar";
  const review = context.review;
  const googleReviewUrl = getGoogleReviewUrl();
  const action = saveCustomerReviewAction.bind(
    null,
    token,
    locale,
    context.drivers.map((driver) => driver.id),
  );
  return (
    <section
      aria-labelledby="customer-review-heading"
      className="mt-8 rounded-lg border bg-card p-5 sm:p-7"
    >
      <h2 className="text-2xl font-black" id="customer-review-heading">
        {ar ? "كيف كانت تجربتك مع نقلك؟" : "How was your experience with Naqlk?"}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {ar ? "رأيك يساعدنا على تحسين الخدمة." : "Your feedback helps us improve our service."}
      </p>
      <form action={action} className="mt-6 space-y-6">
        <StarRating
          defaultValue={review?.overall_rating}
          label={ar ? "التقييم العام (مطلوب)" : "Overall rating (required)"}
          name="overallRating"
          required
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <StarRating
            defaultValue={review?.punctuality_rating}
            label={ar ? "الالتزام بالموعد (اختياري)" : "Punctuality (optional)"}
            name="punctualityRating"
          />
          <StarRating
            defaultValue={review?.handling_rating}
            label={ar ? "العناية بالمنقولات (اختياري)" : "Handling (optional)"}
            name="handlingRating"
          />
        </div>
        {context.drivers.length > 0 && (
          <fieldset className="space-y-4 rounded-md bg-secondary p-4">
            <legend className="px-1 font-black">
              {ar ? "تقييم السائقين (اختياري)" : "Driver ratings (optional)"}
            </legend>
            {context.drivers.map((driver) => (
              <StarRating
                defaultValue={driver.rating}
                key={driver.id}
                label={driver.display_name}
                name={`driver_${driver.id}`}
              />
            ))}
          </fieldset>
        )}
        <label className="block text-sm font-black">
          {ar ? "ملاحظاتك (اختياري)" : "Your comments (optional)"}
          <textarea
            className="mt-2 min-h-28 w-full rounded-md border bg-background p-3 font-normal"
            defaultValue={review?.comment ?? ""}
            maxLength={2000}
            name="comment"
          />
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            className="mt-1 size-4"
            defaultChecked={review?.publication_consent ?? false}
            name="publicationConsent"
            type="checkbox"
          />
          <span>
            {ar
              ? "أوافق على أن تستخدم نقلك مراجعتي علنًا بعد مراجعتها، دون نشر بياناتي الخاصة."
              : "I allow Naqlk to use my review publicly after moderation, without publishing my private information."}
          </span>
        </label>
        <button
          className="min-h-12 rounded-md bg-primary px-6 font-black text-primary-foreground"
          type="submit"
        >
          {review
            ? ar
              ? "تحديث التقييم"
              : "Update review"
            : ar
              ? "إرسال التقييم"
              : "Submit review"}
        </button>
      </form>
      {review && googleReviewUrl && (
        <a
          className="mt-5 inline-flex min-h-11 items-center rounded-md border px-4 font-bold"
          href={googleReviewUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {ar ? "قيّم نقلك على Google" : "Review Naqlk on Google"}
        </a>
      )}
    </section>
  );
}
