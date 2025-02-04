/* eslint-disable @typescript-eslint/no-unused-vars */
import { CSSResult, PropertyValues, TemplateResult, html } from 'lit';
import { VirtualizerController } from '@tanstack/lit-virtual';
import { property } from 'lit/decorators.js';
import { Virtualizer, VirtualItem, VirtualizerOptions } from '@tanstack/virtual-core';
import { StyleInfo } from 'lit/directives/style-map';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import styles from './virtualizedlist.styles';
import { Component } from '../../models';
import { DEFAULT_COUNT, DEFAULT_MEASURE_ELEMENT } from './virtualizedlist.constants';
/**
 * virtualizedlist component, which ...
 *
 * @tagname mdc-virtualizedlist
 *
 */
class VirtualizedList extends Component {
  @property({ type: String })
  test?: string;

  @property({ type: Function, attribute: 'on-scroll' })
  onScroll?: (e: Event) => void;

  @property({ type: Function })
  list = (
    _virtualItems: Array<VirtualItem>,
    _measureElement: (node: Element | null | undefined) => void,
    _style: any,
  ) => Element;

  @property({ type: Object, attribute: 'virtualizer-props' })
  virtualizerProps: Partial<VirtualizerOptions<Element, Element>> = {};

  public scrollElementRef: Ref<HTMLDivElement> = createRef();

  private virtualizerController: VirtualizerController<Element, Element> | null;

  public virtualizer: Virtualizer<Element, Element> | null;

  constructor() {
    super();
    this.virtualizerController = null;
    this.virtualizer = null;
  }

  public override update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
    if (changedProperties.get('virtualizerProps')) {
      this.virtualizer?.setOptions({ ...this.virtualizer.options, ...this.virtualizerProps });
      this.requestUpdate();
    }
  }

  public override connectedCallback(): void {
    this.virtualizerController = new VirtualizerController(this, {
      count: this.virtualizerProps?.count || DEFAULT_COUNT,
      estimateSize: this.virtualizerProps?.estimateSize || DEFAULT_MEASURE_ELEMENT,
      getScrollElement: () => this.scrollElementRef.value || null,
      ...this.virtualizerProps,
    });

    super.connectedCallback();
  }

  private getVirtualizedListElement(): TemplateResult {
    this.virtualizer = this.virtualizerController?.getVirtualizer() || null;

    if (this.virtualizer) {
      const { getVirtualItems, measureElement, getTotalSize } = this.virtualizer;
      const virtualItems = getVirtualItems();
      const style: Readonly<StyleInfo> = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
      };

      return html`<div
          class="mdc-virtualizedlist-wrapper"
          style="height: ${getTotalSize()}px;"
        >
          ${this.list(
    virtualItems,
    measureElement,
    style,
  )}
        </div>`;
    }

    return html``;
  }

  private getVirtualizedListContainer(): TemplateResult {
    return html`<div
        ${ref(this.scrollElementRef)}
        class="mdc-virtualizedlist-scroll-container"
        @scroll="${this.onScroll && this.onScroll}"
      >
        ${this.getVirtualizedListElement()}
      </div>
    `;
  }

  public override render() {
    return this.getVirtualizedListContainer();
  }

  public static override styles: Array<CSSResult> = [...Component.styles, ...styles];
}

export default VirtualizedList;
