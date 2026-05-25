import { TeamMember, imageUrl } from "@/lib/api";

export default function TeamCard({ member }: { member: TeamMember }) {
  const socials = Object.entries(member.socials || {});
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6 text-center">
      <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-brand-50">
        {member.photo ? (
           
          <img
            src={imageUrl(member.photo)}
            alt={member.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-brand-400">
            {member.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">{member.name}</h3>
      <p className="text-sm text-brand-600">{member.role}</p>
      {member.bio && <p className="mt-2 text-sm text-ink/60">{member.bio}</p>}
      {socials.length > 0 && (
        <div className="mt-3 flex justify-center gap-3 text-xs font-medium text-ink/50">
          {socials.map(([key, url]) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="capitalize hover:text-brand-600"
            >
              {key}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
