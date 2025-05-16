'use client';

interface ContactInfo {
  icon: React.ReactNode;
  text: string;
  link?: string;
}

interface SocialLink {
  icon: React.ReactNode;
  text: string;
  link?: string;
}

interface ProfileHeaderProps {
  name: string;
  title: string;
  photoUrl: string;
  photo_upload_option?: boolean;
  contactInfo: ContactInfo[];
  socialLinks: SocialLink[];
}

export default function ProfileHeader({
  name,
  title,
  photoUrl,
  photo_upload_option = true,
  contactInfo,
  socialLinks,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
      {photo_upload_option && (
        <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-md">
          <img
            src={photoUrl}
            alt={`${name}'s profile photo`}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{name}</h1>
        <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mt-1">{title}</p>
        
        <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
          {contactInfo.map((info, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <span className="mr-1.5">{info.icon}</span>
              {info.link ? (
                <a 
                  href={info.link} 
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {info.text}
                </a>
              ) : (
                <span>{info.text}</span>
              )}
            </div>
          ))}
        </div>
        
        {socialLinks.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3 justify-center md:justify-start">
            {socialLinks.map((link, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <span className="mr-1.5">{link.icon}</span>
                {link.link ? (
                  <a 
                    href={link.link} 
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {link.text}
                  </a>
                ) : (
                  <span>{link.text}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}