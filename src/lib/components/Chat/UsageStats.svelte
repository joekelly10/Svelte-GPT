<script>
    import { usage } from '$lib/stores/chat'

    $: cache_used     = $usage.cache_read_tokens > 0 || $usage.cache_write_tokens > 0
    $: cost_string    = '$' + ($usage.total_cost / 100).toFixed(5)
    $: savings_string = '$' + ($usage.total_savings / 100).toFixed(5)
</script>

<div class='usage-stats' class:cache-used={cache_used}>
    <div class='stat messages'>
        <div class='label'>
            chat
        </div>
        <div class='total-messages'>
            {$usage.total_messages} {$usage.total_messages === 1 ? 'message' : 'messages'}
        </div>
    </div>
    <div class='stat tokens'>
        <div class='label'>
            tokens
        </div>
        <div class='input'>
            {$usage.input_tokens} in
        </div>
        <div class='output'>
            {$usage.output_tokens} out
        </div>
    </div>
    {#if cache_used}
        <div class='stat cache'>
            <div class='label'>
                cache
            </div>
            <div class='read'>
                {$usage.cache_read_tokens} read
            </div>
            <div class='write'>
                {$usage.cache_write_tokens} write
            </div>
        </div>
    {/if}
    <div class='stat cost'>
        <div class='label'>
            cost
        </div>
        <div class='total-cost'>
            {cost_string.substring(0,5)}<span class='small'>{cost_string.substring(5)}</span>
        </div>
        {#if $usage.total_savings !== 0}
            <div class='cache-savings'>
                <span class='small'>
                    ({savings_string} saved)
                </span>
            </div>
        {/if}
    </div>
</div>

<style lang='sass'>
    .usage-stats
        position:    fixed
        top:         space.$header-height
        right:       16px
        padding:     space.$default-padding
        line-height: font.$line-height-14px
        text-align:  right
        font-size:   14px
        color:       $background-lightest
    
    .stat
        margin-bottom: space.$default-padding

    .label
        font-size:      12px
        font-weight:    600
        text-transform: uppercase
    
    .small
        margin-left: 0.5px
        font-size:   smaller
</style>
