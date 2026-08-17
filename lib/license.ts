import { ModelLicense } from '@/types';

export class LicenseValidator {
  static readonly ALLOWED_LICENSES: ModelLicense[] = ['MIT', 'Apache-2.0', 'LGPL-3.0'];
  static readonly DENIED_LICENSES: ModelLicense[] = ['GPL-3.0', 'AGPL-3.0', 'CC-BY-NC'];

  static validateLicense(license: ModelLicense): boolean {
    return this.ALLOWED_LICENSES.includes(license);
  }

  static isCommercialFriendly(license: ModelLicense): boolean {
    return this.ALLOWED_LICENSES.includes(license);
  }

  static isRestricted(license: ModelLicense): boolean {
    return this.DENIED_LICENSES.includes(license);
  }

  static getLicenseDescription(license: ModelLicense): string {
    const descriptions: Record<ModelLicense, string> = {
      'MIT': 'MIT License - Permissive, allows commercial use',
      'Apache-2.0': 'Apache License 2.0 - Permissive, allows commercial use with attribution',
      'LGPL-3.0': 'GNU Lesser General Public License v3.0 - Permissive for linking, allows commercial use',
      'GPL-3.0': 'GNU General Public License v3.0 - Copyleft, requires sharing modifications',
      'AGPL-3.0': 'GNU Affero General Public License v3.0 - Strong copyleft, requires network sharing',
      'CC-BY-NC': 'Creative Commons Attribution-NonCommercial - Requires attribution, prohibits commercial use',
      'Other': 'Other license - Please verify commercial use permissions',
    };
    return descriptions[license];
  }

  static validateLicenseString(licenseString: string): ModelLicense | null {
    const normalized = licenseString.toLowerCase().trim();

    const licenses: ModelLicense[] = ['MIT', 'Apache-2.0', 'LGPL-3.0', 'GPL-3.0', 'AGPL-3.0', 'CC-BY-NC'];

    for (const license of licenses) {
      if (normalized.includes(license.toLowerCase())) {
        return license;
      }
    }

    return null;
  }
}
