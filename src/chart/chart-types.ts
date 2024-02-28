/**
 * {@link Chart} defines the public interface to a performance chart.
 */
export interface Chart {

  /**
   * Chart metadata.
   */
  meta: {
    /**
     * Metadata regarding the chart image.
     */
    image: {

      /**
       * URL from which the image can be loaded.
       */
      src: URL;

      /**
       * Pixel dimensions of the image.
       */
      size: [width: number, height: number];
    };

    /**
     * URL from which the chart was loaded, typically a chart definition JSON file of some sort.
     */
    src: URL;
  };
}
