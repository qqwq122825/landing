<?php
declare(strict_types=1);
function totals(?int $id=null):array {
 $where=$id===null?'':' WHERE project_id=?';$args=$id===null?[]:[$id];$today=strtotime('today')*1000;
 $r=query('SELECT COUNT(*) visits, COUNT(DISTINCT ip_address) unique_ips, COALESCE(SUM(clicked),0) conversions, COALESCE(AVG(duration_ms),0) avg_duration, COALESCE(SUM(started_at>=?),0) today_visits FROM visits'.$where,array_merge([$today],$args))->fetch();
 $r['downloads']=(int)query("SELECT COUNT(*) FROM events WHERE type='download'".($id===null?'':' AND project_id=?'),$args)->fetchColumn();
 $r['today_downloads']=(int)query("SELECT COUNT(*) FROM events WHERE type='download' AND created_at>=?".($id===null?'':' AND project_id=?'),array_merge([$today],$args))->fetchColumn();
 foreach($r as $k=>$v)$r[$k]=(int)$v;$r['conversion_rate']=$r['visits']?round(100*$r['conversions']/$r['visits'],1):0;return $r;
}
function stats(int $id):array {
 $days=in_array($_GET['days']??'7',['7','30'],true)?(int)($_GET['days']??7):7;$since=strtotime('today -'.($days-1).' days')*1000;
 $daily=query("SELECT strftime('%Y-%m-%d',started_at/1000,'unixepoch','+8 hours') day,COUNT(*) visits,SUM(clicked) downloads FROM visits WHERE project_id=? AND started_at>=? GROUP BY day",[$id,$since])->fetchAll();$map=array_column($daily,null,'day');$rows=[];
 for($i=$days-1;$i>=0;$i--){$d=date('Y-m-d',strtotime('-'.$i.' days'));$rows[]=$map[$d]??['day'=>$d,'visits'=>0,'downloads'=>0];}
 $page=max(1,min(100000,(int)($_GET['page']??1)));$count=(int)query('SELECT COUNT(*) FROM visits WHERE project_id=? AND started_at>=?',[$id,$since])->fetchColumn();$page=min($page,max(1,(int)ceil($count/25)));$offset=($page-1)*25;
 $visits=query('SELECT started_at,ip_address,country,region,city,device,os,browser,duration_ms,clicked FROM visits WHERE project_id=? AND started_at>=? ORDER BY started_at DESC LIMIT 25 OFFSET '.$offset,[$id,$since])->fetchAll();
 return ['totals'=>totals($id),'daily'=>$rows,'visits'=>$visits,'total'=>$count,'page'=>$page,'pages'=>max(1,(int)ceil($count/25)),'countries'=>query('SELECT country,COUNT(*) count FROM visits WHERE project_id=? AND started_at>=? GROUP BY country ORDER BY count DESC LIMIT 12',[$id,$since])->fetchAll(),'devices'=>query('SELECT device,COUNT(*) count FROM visits WHERE project_id=? AND started_at>=? GROUP BY device ORDER BY count DESC',[$id,$since])->fetchAll(),'updatedAt'=>now_ms()];
}
function page_token(int $id,string $visit,int $issued):string {return hash_hmac('sha256',$id.':'.$visit.':'.$issued,secret());}
function record_event(array $p,array $b):void {
 same_origin();$id=$b['id']??'';$visit=$b['visitId']??'';$issued=$b['issued']??0;$type=$b['type']??'';
 if(!is_string($id)||!is_string($visit)||!preg_match('/^[a-z0-9-]{16,50}$/iD',$id)||!preg_match('/^[a-z0-9-]{16,50}$/iD',$visit)||!is_int($issued)||abs(time()-$issued)>86400||!is_string($b['token']??null)||!hash_equals(page_token((int)$p['id'],$visit,$issued),$b['token'])||!in_array($type,['view','download','stay'],true))throw new HubError('访问凭据不匹配',403);
 if($type==='view'&&$id!==$visit)throw new HubError('访问编号不匹配');
 $elapsed=$b['elapsed']??0;if(!is_numeric($elapsed)||!is_finite((float)$elapsed)||$elapsed<0)throw new HubError('停留时长格式错误');$elapsed=(int)min(86400000,(float)$elapsed);$now=now_ms();
 limit('event:'.$p['id'].':'.hub_ip(),240,60);$v=hub_visitor();
 db()->beginTransaction();
 try{
  // The project may have been removed or paused after the route's initial lookup.
  $p=project($p['slug'],true);
  if($type==='view')query('INSERT OR IGNORE INTO visits(project_id,id,started_at,ip_address,country,region,city,device,os,browser) VALUES(?,?,?,?,?,?,?,?,?,?)',[$p['id'],$visit,$now,$v['ip_address']??'',$v['country'],$v['region'],$v['city'],$v['device'],$v['os'],$v['browser']]);
  $exists=query('SELECT started_at FROM visits WHERE project_id=? AND id=?',[$p['id'],$visit])->fetchColumn();
  if($exists!==false){
   if($type!=='stay')query('INSERT OR IGNORE INTO events(project_id,id,visit_id,type,created_at) VALUES(?,?,?,?,?)',[$p['id'],$id,$visit,$type,$now]);
   query('UPDATE visits SET duration_ms=MAX(duration_ms,CAST(? AS INTEGER)),clicked=MAX(clicked,CAST(? AS INTEGER)) WHERE project_id=? AND id=?',[min($elapsed,max(0,$now-(int)$exists)),$type==='download'?1:0,$p['id'],$visit]);
  }
  db()->commit();
 }catch(Throwable $e){db()->rollBack();throw $e;}
}
