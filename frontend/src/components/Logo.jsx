// Company logo. To use a local asset instead of the remote URL, drop the file
// into /public (e.g. /public/logo.png) and set LOGO_SRC = '/logo.png'.
const LOGO_SRC =
  'https://showtimeconsulting.co.in/static/media/STC_logo-01.9ed192d8729e71102bf5.png';

// `plate` renders the logo on a white card so dark artwork stays visible on
// dark backgrounds. Set plate={false} for placement on an already-light surface.
export const Logo = ({ className = 'h-9', plate = true }) => {
  const img = (
    <img
      src={LOGO_SRC}
      alt="Showtime Consulting"
      className={`${className} w-auto object-contain`}
    />
  );
  if (!plate) return img;
  return (
    <span className="inline-flex items-center rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-black/5">
      {img}
    </span>
  );
};
