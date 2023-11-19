import type {GeolocationService} from "./geolocation-types";

/**
 * Properties for a {@link ReverseGeolocationManager} component.
 */
interface ReverseGeolocationManagerProps {

    /**
     * Geolocation service.
     */
    service: GeolocationService;
}

export default function ReverseGeolocationManager(props: ReverseGeolocationManagerProps) {
    const {service} = props;
    return null;
}