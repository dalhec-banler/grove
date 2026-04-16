import MineView from './CanopyMineView';
import BrowseView from './CanopyBrowseView';
import PeerView from './CanopyPeerView';

export type { MineProps } from './CanopyMineView';
export type { BrowseProps } from './CanopyBrowseView';
export type { PeerProps } from './CanopyPeerView';
export { sortEntries, filterEntries, facets } from '../canopy-utils';

export default function CanopyView(props: Parameters<typeof MineView>[0] | Parameters<typeof BrowseView>[0] | Parameters<typeof PeerView>[0]) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 pt-5 pb-3">
        <h1 className="text-lg font-semibold text-canopy">Canopy</h1>
        <p className="text-xs text-muted mt-0.5">Publish files to the network, discover what others are sharing, and subscribe to catalogs ship-to-ship.</p>
      </div>
      {props.kind === 'mine' ? <MineView {...props} /> :
       props.kind === 'browse' ? <BrowseView {...props} /> :
       <PeerView {...props} />}
    </div>
  );
}
