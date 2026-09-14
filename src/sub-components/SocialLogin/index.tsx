import { observer } from "@ikas/component-utils";
import { customerStore, socialLogin } from "@ikas/bp-storefront";
import { GoogleIcon, FacebookIcon } from "../Icons";

interface Props {
  showGoogle?: boolean;
  googleText?: string;
  showFacebook?: boolean;
  facebookText?: string;
  dividerText?: string;
  /** Sağlayıcıya yönlendirme başarısız (ör. admin'de sosyal giriş kurulu değil). */
  onError?: () => void;
}

/** Google / Facebook ile devam et + "veya" ayracı. Butonlar sağlayıcıya yönlendirir. */
const SocialLogin = observer(function SocialLogin({ showGoogle, googleText, showFacebook, facebookText, dividerText, onError }: Props) {
  if (!showGoogle && !showFacebook) return null;

  // Sağlayıcı ayarı yoksa ikas JSON yerine HTML döner ve socialLogin reddedilir; sessiz kalmasın.
  const start = (provider: "google" | "facebook") => {
    socialLogin(customerStore, provider).catch(() => onError?.());
  };

  return (
    <div className="sl">
      <div className="sl__buttons">
        {showGoogle && (
          <button type="button" className="sl__btn" onClick={() => start("google")}>
            <GoogleIcon className="sl__icon" />
            <span>{googleText}</span>
          </button>
        )}
        {showFacebook && (
          <button type="button" className="sl__btn" onClick={() => start("facebook")}>
            <FacebookIcon className="sl__icon" />
            <span>{facebookText}</span>
          </button>
        )}
      </div>
      {dividerText && (
        <div className="sl__divider" role="separator">
          <span>{dividerText}</span>
        </div>
      )}
    </div>
  );
});

export default SocialLogin;
