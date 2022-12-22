import { Package } from '../../_bldr/_processes/package';
const { packageConfig } = new Package();

/**
 * Flag routing for init command
 *
 */
export async function PackageSwitch() {
    return packageConfig();
}
