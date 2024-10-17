<script>
    import { createEventDispatcher, tick } from 'svelte'
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { initialising, messages, forks, active_fork, active_messages, fork_points, usage, loader_active, prompt_editor_active, deleting, adding_reply, provisionally_forking } from '$lib/stores/chat'
    import { insert } from '$lib/utils/helpers'
    import Message from '$lib/components/Chat/Message.svelte'

    const dispatch = createEventDispatcher()
    
    let chat,
        forking_from      = null,
        uparrow_limiter   = null,
        downarrow_limiter = null

    export const sendingMessage = () => $provisionally_forking = false

    export const scrollToBottom = (delay = 0) => {
        //  HACK: account for delay on fork animations
        setTimeout(() => chat.scroll({ top: chat.scrollHeight, behavior: 'smooth' }), delay)
    }

    const keydown = (e) => {
        if ($loader_active || $prompt_editor_active) return

        if (e.shiftKey && e.altKey && e.key === 'ArrowUp') {
            return chat.scroll({ top: 0, behavior: 'smooth' })
        }
        if (e.shiftKey && e.altKey && e.key === 'ArrowDown') {
            return chat.scroll({ top: chat.scrollHeight, behavior: 'smooth' })
        }
        if (e.altKey && e.key === 'ArrowUp') {
            if (uparrow_limiter) return
            uparrow_limiter = setTimeout(() => { uparrow_limiter = null }, 200)
            return chat.scrollBy({ top: -480, behavior: 'smooth' })
        }
        if (e.altKey && e.key === 'ArrowDown') {
            if (downarrow_limiter) return
            downarrow_limiter = setTimeout(() => { downarrow_limiter = null }, 200)
            return chat.scrollBy({ top: 480, behavior: 'smooth' })
        }
        if (e.ctrlKey && e.key === 'Backspace') {
            return deleteMessage($messages.length-1)
        }
        if (e.ctrlKey && e.key === 'r') {
            return regenerateReply()
        }
        if (e.key === 'Escape') {
            if ($forks[$active_fork].provisional) return cancelProvisionalFork()
        }
    }

    const regenerateReply = async () => {
        if (confirm(`Regenerate this reply?  Press OK to confirm.`)) {
            $deleting = true
            await tick()

            const deleted = $forks[$active_fork].message_ids.splice(-1,1)
            $messages = $messages.filter(m => m.id !== deleted[0])
            dispatch('regenerateReply')

            await tick()
            $deleting = false
        }
    }

    const deleteMessage = async (delete_both = false) => {
        if (confirm(`Delete this message?  Press OK to confirm.`)) {
            $deleting = true
            await tick()

            let deleted
            if (delete_both) {
                deleted = $forks[$active_fork].message_ids.splice(-2,2)
            } else {
                deleted = $forks[$active_fork].message_ids.splice(-1,1)
            }

            $messages = $messages.filter(m => !deleted.includes(m.id))
            updateForksAfterDelete()
            dispatch('chatModified')

            await tick()
            $deleting = false
        }
    }

    const addReply = async (message_id) => {
        $adding_reply = true
        if ($provisionally_forking) {
            forking_from = null
            $provisionally_forking = false
            removeProvisionalFork()
        }
        insert(message_id, $forks[$active_fork].forked_at)
        const forked_at   = $forks[$active_fork].forked_at.filter(id => id <= message_id)
        const message_ids = $forks[$active_fork].message_ids.filter(id => id <= message_id)
        $forks       = $forks.concat([{ message_ids, forked_at, provisional: false }])
        $active_fork = $forks.length - 1
        dispatch('chatModified')
        dispatch('addReply')
    }

    const forkFrom = async (message_id) => {
        forking_from = $active_fork
        $provisionally_forking = true
        insert(message_id, $forks[$active_fork].forked_at)
        const forked_at   = $forks[$active_fork].forked_at.filter(id => id <= message_id)
        const message_ids = $forks[$active_fork].message_ids.filter(id => id <= message_id)
        $forks       = $forks.concat([{ message_ids, forked_at, provisional: true }])
        $active_fork = $forks.length - 1
        dispatch('chatModified')
    }

    const getForksAt = (message_id) => {
        const fork_pts = $fork_points.filter(pair => pair[0] === message_id)
        let all_forks = []
        fork_pts.forEach(fp => {
            const index         = firstIndexOf(fp)
            const active_ids    = $forks[$active_fork].message_ids
            const message_index = active_ids.indexOf(message_id)
            const is_active     = fp[1] === active_ids[message_index + 1]
            const provisional   = $forks[index]?.provisional
            all_forks.push({ index, is_active, provisional })
        })
        return all_forks
    }

    const firstIndexOf = (fork_point) => {
        const index = $forks.findIndex(fork => {
            const index = fork.message_ids.findIndex(id => id === fork_point[0])
            return fork.message_ids[index + 1] === fork_point[1]
        })
        return index
    }

    const switchToFork = async (fork_index) => {
        $active_fork = fork_index
        if (forking_from !== null) {
            forking_from = null
            $provisionally_forking = false
            removeProvisionalFork()
        }
        dispatch('chatModified')
    }

    const removeProvisionalFork = () => {
        for (let i = 0; i < $forks.length; i++) {
            if ($forks[i].provisional) {
                const forked_at = $forks[i].forked_at[$forks[i].forked_at.length - 1]

                //  Remove the fork point from the other fork if there's only
                //  one other fork left after removing the provisional one

                let other_forks = []
                for (let _i = 0; _i < $forks.length; _i++) {
                    if (i === _i) continue
                    if ($forks[_i].forked_at.includes(forked_at)) other_forks.push(_i)
                }
                if (other_forks.length === 1) {
                    const index = other_forks[0]
                    $forks[index].forked_at = $forks[index].forked_at.filter(id => id !== forked_at)
                }

                $forks.splice(i,1)

                //  if the provisional fork was not at the end of the array when
                //  removed, which can happen when deleting messages on an
                //  old fork, `active_fork` may go out of range:

                if ($active_fork > $forks.length - 1) $active_fork -= 1
            }
        }
        $forks = $forks
    }

    const updateForksAfterDelete = () => {
        for (let i = 0; i < $forks.length; i++) {
            const fork            = $forks[i],
                  last_forked_at  = fork.forked_at[fork.forked_at.length - 1],
                  last_message_id = fork.message_ids[fork.message_ids.length - 1],
                  last_message    = $messages[last_message_id]

            if (last_message?.role === 'assistant' && last_forked_at === last_message_id) {

                //  If we've deleted messages back to a fork point, (re)set the fork
                //  to provisional.

                for (let _i = 0; _i < $forks.length; _i++) {
                    if (_i === i) continue
                    if ($forks[_i].forked_at.includes(last_forked_at)) {
                        forking_from = _i
                        $forks[i].provisional = true
                        $provisionally_forking = true
                    }
                }
            } else if (last_message?.role === 'user') {

                //  If we've deleted 1 out of 2 replies, so there's now only one
                //  fork left, remove the fork point (`forked_at`) from the one
                //  remaining fork then switch to it.
                //
                //  If we've deleted 1 out of 3+ replies, switch to the closest
                //  sibling fork, e.g.:
                //      - if we've deleted fork 4 of 4, switch to fork 3 of 3.
                //      - if we've deleted fork 1 of 4, switch to fork 2 of 3.
                //      - if we've deleted fork 2 of 4, switch to fork 1 of 3.

                let sibling_indexes = []
                for (let _i = 0; _i < $forks.length; _i++) {
                    if (_i === i) continue
                    if ($forks[_i].forked_at.includes(last_message_id)) sibling_indexes.push(_i)
                }

                if (sibling_indexes.length === 1) {
                    let _i = sibling_indexes[0]
                    $forks[_i].forked_at = $forks[_i].forked_at.filter(id => id !== last_forked_at)
                    if (_i < i) {
                        switchToFork(_i)
                        $forks.splice(i, 1)
                    } else {
                        $forks.splice(i, 1)
                        switchToFork(_i - 1)
                    }
                } else if (sibling_indexes.length > 1) {

                    //  find the element closest to i in `sibling_indexes` that
                    //  is less than it.  If there is no such element, use the
                    //  first element.

                    let closest_index = sibling_indexes.reduce((closest, current) => {
                        return (current < i && current > closest) ? current : closest
                    }, sibling_indexes[0])

                    if (closest_index < i) {
                        switchToFork(closest_index)
                        $forks.splice(i, 1)
                    } else {
                        $forks.splice(i, 1)
                        switchToFork(closest_index - 1)
                    }
                }
            }
        }
        $forks = $forks
    }

    const cancelProvisionalFork = () => switchToFork(forking_from)

    $: processed_messages = $active_messages.slice(1).map((message, i) => ({
        ...message,
        is_last:      i === $active_messages.slice(1).length - 1,
        forks:        getForksAt(message.id),
        has_siblings: getForksAt(message.parent_id).length > 0
    }))
</script>

<svelte:document on:keydown={keydown} />

<section class='chat' class:frozen={$loader_active || $prompt_editor_active} bind:this={chat}>
    {#if $initialising}
        <div class='initialising' out:fade={{ delay: 250, duration: 125, easing: quartOut }}>
            Initialising...
        </div>
    {/if}

    {#if $usage.total_messages > 0}
        <div class='stats'>
            {$usage.total_messages} {$usage.total_messages === 1 ? 'message' : 'messages'}<br>
            in {$usage.input_tokens} / out {$usage.output_tokens}<br>
            ${($usage.total_cost / 100).toFixed(5)}
        </div>
    {/if}

    <div class='messages'>
        {#each processed_messages as message (message.id)}
            <Message
                message={message}
                on:regenerateReply={regenerateReply}
                on:deleteOne={() => deleteMessage(false)}
                on:deleteBoth={() => deleteMessage(true)}
                on:addReply={(event) => addReply(event.detail.message_id)}
                on:forkFrom={(event) => forkFrom(event.detail.message_id)}
                on:switchToFork={(event) => switchToFork(event.detail.fork_index)}
                on:cancelProvisionalFork={cancelProvisionalFork}
            />
        {/each}
    </div>
</section>

<style lang='sass'>
    .chat
        flex-grow:  1
        position:   relative
        overflow-y: overlay
        +shared.scrollbar

        &.frozen
            overflow: hidden
    
    .initialising
        position:  absolute
        top:       50%
        left:      50%
        transform: translate(-50%, -50%)
        color:     $background-lightest
        font-size: 14px
    
    .stats
        position:      fixed
        top:           space.$header-height
        right:         16px
        padding:       space.$default-padding
        border-radius: 8px
        line-height:   1.6
        text-align:    right
        font-size:     14px
        color:         $background-lightest
        
    .messages
        margin:         0 auto
        width:          space.$main-column-width
        padding-bottom: 84px
</style>
